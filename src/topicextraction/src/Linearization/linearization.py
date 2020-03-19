from lapjv import lapjv
from scipy.spatial.distance import cdist
from scipy.interpolate import griddata
import numpy as np

def mapToSpaceSampling(points):
    approximation_epsilon = 4
    grid = np.dstack(np.meshgrid(
        np.linspace(np.min(points[:, 0]), np.max(points[:, 0]), int(np.sqrt(len(points))) + approximation_epsilon),
        np.linspace(np.min(points[:, 1]), np.max(points[:, 1]),
                    int(np.sqrt(len(points))) + approximation_epsilon))).reshape(-1, 2)

    grid[::2] += [0, (grid[0, 1] - grid[int(np.sqrt(len(points))) + approximation_epsilon, 1]) / 2]

    D = cdist([grid.mean(axis=0)], grid)
    grid = np.delete(grid, D[0].argsort()[points.shape[0]:][::-1], axis=0)
    cost = cdist(points, grid, "sqeuclidean").astype(np.float64)
    cost *= 100000 / cost.max()
    row_ind_lapjv, col_ind_lapjv, _ = lapjv(cost, verbose=True, force_doubles=True)
    points = grid[row_ind_lapjv]
    return points - np.amin(points, axis=0)

def computeClusterTopography(points, values, width, height, interpolation='linear'):
    # lay grid over the points so that all points are covered
    grid_x, grid_y = np.mgrid[np.min(points[:,0]):np.max(points[:,0]):width*1j, np.min(points[:,1]):np.max(points[:,1]):height*1j]
    return griddata(np.array(points), np.array(values[:len(points)]), (grid_x, grid_y), method=interpolation, fill_value=np.min(values[:len(points)]))