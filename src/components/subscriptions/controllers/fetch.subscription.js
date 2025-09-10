import SubscriptionModel from "../models/subscription.model.js";

const listAllSubscription = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    let offset = (page - 1) * limit;

    let { rows: items, count } = await SubscriptionModel.findAndCountAll({
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error while listing all shop: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export { listAllSubscription };
