# Reproduce the original 2021 algorithms. Run from the project directory.
options(encoding = "UTF-8")
if (.Platform$OS.type == "windows") Sys.setlocale("LC_CTYPE", "Chinese (Traditional)_Taiwan.950")
.libPaths(c("C:/Users/user/Documents/R/win-library/4.1", .libPaths()))
for (p in c("igraph", "sf", "jsonlite")) {
  if (!requireNamespace(p, quietly = TRUE)) stop(paste("Missing package:", p))
}
library(igraph)
library(sf)
library(jsonlite)
source_dir <- "../2021netfinal"
edges <- read.csv(file.path(source_dir, "network/od.csv"), fileEncoding = "UTF-8-BOM")
nodes <- read.csv(file.path(source_dir, "network/nodeattribute.csv"), fileEncoding = "CP950")
english <- read.csv(file.path(source_dir, "network/app/nodeattribute.csv"), fileEncoding = "UTF-8-BOM")
extra <- read.csv(file.path(source_dir, "network/od_nobus.csv"), fileEncoding = "UTF-8-BOM")
stopifnot(nrow(nodes) == 26, nrow(edges) == 44, sum(edges$Freq) == 213)
stopifnot(all(nodes$lat == english$lat), all(nodes$lon == english$lon))
nodes$en <- english$nodename
nodes[] <- lapply(nodes, function(x) if (is.character(x)) enc2utf8(x) else x)
g <- graph_from_data_frame(edges, directed = FALSE, vertices = nodes)
g_full <- graph_from_data_frame(extra, directed = FALSE, vertices = nodes)
calculate <- function(graph, weighted = FALSE) {
  w <- if (weighted) E(graph)$Freq else NULL
  data.frame(
    betweenness = unname(betweenness(graph, directed = FALSE, weights = w, normalized = FALSE)),
    eigen = unname(eigen_centrality(graph, directed = FALSE, scale = TRUE, weights = w)$vector),
    constraint = unname(constraint(graph, weights = w))
  )
}
metrics <- list(original = calculate(g), weighted = calculate(g, TRUE), full = calculate(g_full))
base <- st_read(file.path(source_dir, "network/app/changhua.shp"), quiet = TRUE)
cat("Boundary columns:", names(base), "\n")
# Keep the original boundaries and coordinates; no geometry simplification.
features <- lapply(seq_len(nrow(base)), function(i) {
  geom <- st_geometry(base)[[i]]
  # sf geometry nesting already corresponds to GeoJSON polygon rings.
  type <- if (inherits(geom, "MULTIPOLYGON")) "MultiPolygon" else "Polygon"
  list(type = "Feature", properties = as.list(st_drop_geometry(base[i, ])),
       geometry = list(type = type, coordinates = unclass(geom)))
})
payload <- list(nodes = nodes, edges = edges, extraEdges = extra[extra$Freq == 0, ],
  metrics = metrics, boundaries = list(type = "FeatureCollection", features = features),
  provenance = list(snapshot = "2021-06-20 / 2021-06-21", populationYear = 2020,
    igraph = as.character(packageVersion("igraph")), directed = FALSE,
    weightedBetweenness = "Freq as distance; original 2021 definition",
    sources = c("network/od.csv", "network/od_nobus.csv", "network/nodeattribute.csv", "network/app/changhua.shp")))
json <- toJSON(payload, dataframe = "rows", auto_unbox = TRUE, digits = 15, matrix = "rowmajor")
if ("--stdout" %in% commandArgs(TRUE)) {
  cat("DATA_START\n", enc2utf8(paste0("window.CHANGHUA_DATA = ", json, ";")), "\nDATA_END\n", sep = "")
} else {
  writeBin(charToRaw(enc2utf8(paste0("window.CHANGHUA_DATA = ", json, ";"))), "assets/data.js")
  cat("Exported 26 nodes, 44 edges, 10 scenario edges and 234 metric values.\n")
}
