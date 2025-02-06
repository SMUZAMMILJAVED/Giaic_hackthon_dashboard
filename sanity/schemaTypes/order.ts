export default {
    name: "order",
    type: "document",
    title: "Order",
    fields: [
      {
        name: "orderId",
        type: "string",
        title: "Order ID",
      },
      {
        name: "items",
        type: "array",
        title: "Order Items",
        of: [
          {
            type: "object",
            fields: [
              { name: "productId", type: "string", title: "Product ID" },
              { name: "title", type: "string", title: "Title" },
              { name: "price", type: "number", title: "Price" },
              { name: "quantity", type: "number", title: "Quantity" },
            ],
          },
        ],
      },
      {
        name: "billingInfo",
        type: "object",
        title: "Billing Information",
        fields: [
          { name: "fullName", type: "string", title: "Full Name" },
          { name: "email", type: "string", title: "Email" },
          { name: "address", type: "string", title: "Address" },
          { name: "city", type: "string", title: "City" },
          { name: "zipCode", type: "string", title: "Zip Code" },
        ],
      },
      {
        name: "totalAmount",
        type: "number",
        title: "Total Amount",
      },
      {
        name: "status",
        type: "string",
        title: "Status",
        options: {
          list: ["Placed", "Shipped", "Delivered", "Cancelled"],
        },
      },
    ],
  };
  