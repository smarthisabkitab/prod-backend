import ShopModel from "../../shop/models/shop.model.js";
import {
  createShopConnection,
  createShopModels,
} from "../../shop/models/shop.factory.js";

export const readShopTransaction = async (req, res) => {
  let shopSequelize;
  
  try {
    const { shop_id } = req.params;
    
    // Validate shop_id
    if (!shop_id) {
      console.log("Shop Transaction -> Invalid Shop ID");
      return res.status(400).json({
        success: false,
        message: "Invalid Shop ID",
      });
    }

    // Find shop
    const shop = await ShopModel.findByPk(shop_id);
    if (!shop) {
      console.log("Shop Transaction -> Shop not found");
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Get shop-specific connection + models
    shopSequelize = createShopConnection(shop.db_name);
    const { Customer, Product, Transaction } = createShopModels(shopSequelize);

    // Test database connection
    await shopSequelize.authenticate();

    // Fetch all data with associations
    const [customers, products, transactions] = await Promise.all([
      Customer.findAll({
        include: [{
          model: Transaction,
          include: [Product]
        }],
        order: [['createdAt', 'DESC']]
      }),
      
      Product.findAll({
        include: [{
          model: Transaction,
          include: [Customer]
        }],
        order: [['createdAt', 'DESC']]
      }),
      
      Transaction.findAll({
        include: [
          {
            model: Customer,
            attributes: ['id', 'fullname', 'phone_no', 'address']
          },
          {
            model: Product,
            attributes: ['id', 'product_name', 'quantity', 'total_weight', 'date_of_issue']
          }
        ],
        order: [['pledged_date', 'DESC']]
      })
    ]);

    // Calculate additional data for response
    const summary = {
      total_customers: customers.length,
      total_products: products.length,
      total_transactions: transactions.length,
      active_transactions: transactions.filter(t => t.status === 'active').length,
      closed_transactions: transactions.filter(t => t.status === 'closed').length,
      total_given_amount: transactions.reduce((sum, t) => sum + parseFloat(t.given_amount), 0),
      total_received_interest: transactions.reduce((sum, t) => sum + parseFloat(t.received_interest), 0)
    };

    return res.status(200).json({
      success: true,
      message: "Data retrieved successfully",
      data: {
        summary,
        customers: customers.map(customer => ({
          id: customer.id,
          fullname: customer.fullname,
          phone_no: customer.phone_no,
          address: customer.address,
          total_transactions: customer.Transactions ? customer.Transactions.length : 0,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt
        })),
        products: products.map(product => ({
          id: product.id,
          product_name: product.product_name,
          quantity: product.quantity,
          total_weight: product.total_weight,
          date_of_issue: product.date_of_issue,
          associated_transactions: product.Transactions ? product.Transactions.length : 0,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        })),
        transactions: transactions.map(transaction => ({
          id: transaction.id,
          customer: transaction.Customer ? {
            id: transaction.Customer.id,
            fullname: transaction.Customer.fullname,
            phone_no: transaction.Customer.phone_no
          } : null,
          product: transaction.Product ? {
            id: transaction.Product.id,
            product_name: transaction.Product.product_name,
            quantity: transaction.Product.quantity,
            total_weight: transaction.Product.total_weight
          } : null,
          pledged_date: transaction.pledged_date,
          given_amount: transaction.given_amount,
          interest_rate: transaction.interest_rate,
          time_duration: transaction.time_duration,
          received_interest: transaction.received_interest,
          status: transaction.status,
          add_amount: transaction.add_amount,
          decrease_amount: transaction.decrease_amount,
          amount_changed_date: transaction.amount_changed_date,
          amount_end_date: transaction.amount_end_date,
          bank_number: transaction.bank_number,
          notes: transaction.notes,
          pending_interest: transaction.calculateInterest ? transaction.calculateInterest() : 0,
          is_overdue: transaction.isOverdue ? transaction.isOverdue() : false,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt
        }))
      }
    });

  } catch (error) {
    console.error(`Shop Transaction Read Error -> ${error.message}`);
    
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve shop data",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Optional: Add separate endpoints for individual entities
export const readShopCustomers = async (req, res) => {
  try {
    const { shop_id } = req.params;
    
    if (!shop_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Shop ID",
      });
    }

    const shop = await ShopModel.findByPk(shop_id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const shopSequelize = createShopConnection(shop.db_name);
    const { Customer, Transaction } = createShopModels(shopSequelize);

    const customers = await Customer.findAll({
      include: [{
        model: Transaction,
        attributes: ['id', 'status', 'given_amount', 'pledged_date']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: customers
    });

  } catch (error) {
    console.error(`Shop Customers Read Error -> ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve customers",
      error: error.message
    });
  }
};

export const readShopProducts = async (req, res) => {
  try {
    const { shop_id } = req.params;
    
    if (!shop_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Shop ID",
      });
    }

    const shop = await ShopModel.findByPk(shop_id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const shopSequelize = createShopConnection(shop.db_name);
    const { Product, Transaction } = createShopModels(shopSequelize);

    const products = await Product.findAll({
      include: [{
        model: Transaction,
        attributes: ['id', 'status', 'customer_id', 'pledged_date']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error(`Shop Products Read Error -> ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
      error: error.message
    });
  }
};

export const readShopTransactions = async (req, res) => {
  try {
    const { shop_id } = req.params;
    
    if (!shop_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Shop ID",
      });
    }

    const shop = await ShopModel.findByPk(shop_id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const shopSequelize = createShopConnection(shop.db_name);
    const { Transaction, Customer, Product } = createShopModels(shopSequelize);

    const transactions = await Transaction.findAll({
      include: [
        {
          model: Customer,
          attributes: ['id', 'fullname', 'phone_no']
        },
        {
          model: Product,
          attributes: ['id', 'product_name', 'quantity', 'total_weight']
        }
      ],
      order: [['pledged_date', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error(`Shop Transactions Read Error -> ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions",
      error: error.message
    });
  }
};