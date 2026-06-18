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
                                CategoryID = Convert.ToInt16(reader["CategoryID"]),
                                CategoryName = reader["CategoryName"].ToString(),
                                ProductName = reader["ProductName"].ToString(),
                                Description = reader["Description"].ToString(),
                                Price = Convert.ToDecimal(reader["Price"]),
                                LeadTime = Convert.ToInt16(reader["LeadTime"]),
                                ReorderLevel = Convert.ToInt32(reader["ReorderLevel"]),
                                MinimumStockQuantity = Convert.ToInt32(reader["MinimumStockQuantity"]),
                                SupplierID = Convert.ToInt32(reader["SupplierID"]),
                                SupplierName = reader["SupplierName"].ToString()
                            });
                        }
                    }
                }
                return Ok(products);
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProductAsync(int id, [FromBody] ProductRequest request)
        {
            try
            {
                using (MySqlConnection conn = new MySqlConnection(_connectionString))
                using (MySqlCommand cmd = new MySqlCommand("sp_UpdateProduct", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@p_ID", id);
                    cmd.Parameters.AddWithValue("@p_CatID", request.CategoryID);
                    cmd.Parameters.AddWithValue("@p_Name", request.ProductName);
                    cmd.Parameters.AddWithValue("@p_Desc", request.Description);
                    cmd.Parameters.AddWithValue("@p_Price", request.Price);
                    cmd.Parameters.AddWithValue("@p_Lead", request.LeadTime);
                    cmd.Parameters.AddWithValue("@p_Reorder", request.ReorderLevel);
                    cmd.Parameters.AddWithValue("@p_Min", request.MinimumStockQuantity);
                    cmd.Parameters.AddWithValue("@p_SupID", request.SupplierID);

                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
                return Ok(new { message = "Product successfully updated!" });
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProductAsync(int id)
        {
            try
            {
                using (MySqlConnection conn = new MySqlConnection(_connectionString))
                using (MySqlCommand cmd = new MySqlCommand("sp_DeleteProduct", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@p_ID", id);

                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
                return Ok(new { message = "Product successfully deleted!" });
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }
    }
}