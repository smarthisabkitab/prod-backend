export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Specific role middlewares
export const requireAdmin = requireRole(["admin"]);
export const requireSubscriber = requireRole(["subscriber", "admin"]);
export const requireUser = requireRole(["user", "subscriber", "admin"]);
