using InventoryBackend.Models;
using InventoryBackend.Utils;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Data;

namespace InventoryBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly string _connectionString;

        public ProductsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                                ?? throw new InvalidOperationException("Connection string not found.");
        }

        [HttpPost]
        public async Task<IActionResult> CreateProductAsync([FromBody] ProductRequest request)
        {
            try
            {
                using (MySqlConnection conn = new MySqlConnection(_connectionString))
                {
                    using (MySqlCommand cmd = new MySqlCommand("sp_InsertProduct", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@p_CategoryID", request.CategoryID);
                        cmd.Parameters.AddWithValue("@p_ProductName", request.ProductName);
                        cmd.Parameters.AddWithValue("@p_Description", request.Description);
                        cmd.Parameters.AddWithValue("@p_Price", request.Price);
                        cmd.Parameters.AddWithValue("@p_LeadTime", request.LeadTime);
                        cmd.Parameters.AddWithValue("@p_ReorderLevel", request.ReorderLevel);
                        cmd.Parameters.AddWithValue("@p_MinimumStockQuantity", request.MinimumStockQuantity);
                        cmd.Parameters.AddWithValue("@p_SupplierID", request.SupplierID);

                        await conn.OpenAsync();
                        await cmd.ExecuteNonQueryAsync();
                    }
                }
                return Ok(new { message = "Product successfully created!" });
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProductsAsync()
        {
            try
            {
                List<ProductResponse> products = new List<ProductResponse>();

                using (MySqlConnection conn = new MySqlConnection(_connectionString))
                {
                    using (MySqlCommand cmd = new MySqlCommand("sp_GetAllProducts", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        await conn.OpenAsync();

                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                products.Add(new ProductResponse
                                {
                                    ProductID = Convert.ToInt32(reader["ProductID"]),
                                    CategoryName = reader["CategoryName"].ToString(),
                                    ProductName = reader["ProductName"].ToString(),
                                    Description = reader["Description"].ToString(),
                                    Price = Convert.ToDecimal(reader["Price"]),
                                    ReorderLevel = Convert.ToInt32(reader["ReorderLevel"]),
                                    SupplierName = reader["SupplierName"].ToString()
                                });
                            }
                        }
                    }
                }
                return Ok(products);
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }
    }
}