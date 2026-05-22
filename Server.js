module.exports = {
  // Global margin configuration (e.g.,5% hidden profit markup applied to all rates)
  GLOBAL_MARGIN: 5,

  // Mock endpoints representing real supplier REST API connections
  SUPPLIERS: {
    FLEET_A: {
      name: "Global Fleet Logistics",
      apiUrl: "https://api.supplier-a.com/v1/quotes",
      apiKey: process.env.SUPPLIER_A_KEY
    },
    FLEET_B: {
      name: "Premium Terminal Transfers",
      apiUrl: "https://api.supplier-b.com/v2/rates",
      apiKey: process.env.SUPPLIER_B_KEY
    }
  }
};
