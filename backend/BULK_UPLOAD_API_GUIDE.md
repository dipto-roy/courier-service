# 📦 Bulk Upload Shipments API Guide

## 🔗 Endpoint

```
POST http://localhost:3001/api/shipments/bulk-upload
```

## 🔐 Authentication

Required: **Bearer Token** (Merchant or Admin role)

```
Authorization: Bearer <your_access_token>
```

## 📋 Request Format

### Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

### Body (JSON)
```json
{
  "csvData": "receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType\nJane Smith,01798765432,Dhaka,Dhanmondi,House 5 Road 3,2.5,3500,normal\nMichael Johnson,01687654321,Chittagong,Nasirabad,Building 10 Block A,1.2,1500,express"
}
```

## 📊 CSV Format

### Required Columns (in order):

1. **receiverName** - Full name of the receiver
2. **receiverPhone** - Phone number (11 digits starting with 01)
3. **receiverCity** - City name (e.g., Dhaka, Chittagong)
4. **receiverArea** - Area/locality name (e.g., Gulshan, Dhanmondi)
5. **receiverAddress** - Full address
6. **weight** - Package weight in kg (decimal, e.g., 1.5)
7. **codAmount** - Cash on Delivery amount (decimal, e.g., 2500.00)
8. **deliveryType** - Delivery type: `normal` or `express`

### CSV Example:

```csv
receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType
Jane Smith,01798765432,Dhaka,Dhanmondi,House 5 Road 3,2.5,3500,normal
Michael Johnson,01687654321,Chittagong,Nasirabad,Building 10 Block A,1.2,1500,express
Sarah Williams,01755555555,Dhaka,Mirpur,Road 11 Block C,1.8,2000,normal
```

## 📤 Response Format

### Success Response (201 Created)

```json
{
  "totalRows": 3,
  "successCount": 3,
  "failedCount": 0,
  "errors": [],
  "shipments": [
    {
      "awb": "FX20251028929833",
      "receiverName": "Jane Smith",
      "receiverPhone": "01798765432"
    },
    {
      "awb": "FX20251028775435",
      "receiverName": "Michael Johnson",
      "receiverPhone": "01687654321"
    },
    {
      "awb": "FX20251028649856",
      "receiverName": "Sarah Williams",
      "receiverPhone": "01755555555"
    }
  ]
}
```

### Partial Success Response

```json
{
  "totalRows": 3,
  "successCount": 2,
  "failedCount": 1,
  "errors": [
    {
      "row": 3,
      "error": "Invalid phone number format"
    }
  ],
  "shipments": [
    {
      "awb": "FX20251028929833",
      "receiverName": "Jane Smith",
      "receiverPhone": "01798765432"
    },
    {
      "awb": "FX20251028775435",
      "receiverName": "Michael Johnson",
      "receiverPhone": "01687654321"
    }
  ]
}
```

## ⚠️ Error Responses

### 400 Bad Request - Missing CSV Data
```json
{
  "success": false,
  "statusCode": 400,
  "message": ["CSV data is required and must be a valid string"],
  "timestamp": "2025-10-28T02:55:42.611Z",
  "path": "/api/shipments/bulk-upload"
}
```

### 400 Bad Request - Invalid CSV Format
```json
{
  "success": false,
  "statusCode": 400,
  "message": ["CSV must contain at least a header row and one data row"],
  "timestamp": "2025-10-28T02:55:42.611Z",
  "path": "/api/shipments/bulk-upload"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "message": ["Unauthorized"],
  "timestamp": "2025-10-28T02:55:42.611Z",
  "path": "/api/shipments/bulk-upload"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "statusCode": 403,
  "message": ["Forbidden resource"],
  "timestamp": "2025-10-28T02:55:42.611Z",
  "path": "/api/shipments/bulk-upload"
}
```

## 🧪 Testing Examples

### Example 1: Using curl

```bash
curl -X POST http://localhost:3001/api/shipments/bulk-upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "csvData": "receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType\nJane Smith,01798765432,Dhaka,Dhanmondi,House 5 Road 3,2.5,3500,normal\nMichael Johnson,01687654321,Chittagong,Nasirabad,Building 10 Block A,1.2,1500,express"
  }'
```

### Example 2: Using Postman

1. **Method:** POST
2. **URL:** `http://localhost:3001/api/shipments/bulk-upload`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_ACCESS_TOKEN`
4. **Body (raw JSON):**
```json
{
  "csvData": "receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType\nJane Smith,01798765432,Dhaka,Dhanmondi,House 5 Road 3,2.5,3500,normal"
}
```

### Example 3: Using JavaScript/Fetch

```javascript
const csvData = `receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType
Jane Smith,01798765432,Dhaka,Dhanmondi,House 5 Road 3,2.5,3500,normal
Michael Johnson,01687654321,Chittagong,Nasirabad,Building 10 Block A,1.2,1500,express`;

const response = await fetch('http://localhost:3001/api/shipments/bulk-upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({ csvData })
});

const result = await response.json();
console.log(result);
```

## 📝 Important Notes

### Sender Information
- **Automatically filled** from the logged-in merchant's profile
- Includes: name, phone, email, city, area, address
- If merchant details are incomplete, defaults are used

### Delivery Fee Calculation
- **Automatically calculated** based on:
  - Weight
  - Distance (estimated from sender/receiver cities)
  - Delivery type (normal/express)
  - COD amount

### AWB (Air Waybill) Generation
- **Automatically generated** for each shipment
- Format: `FX` + `YYYYMMDD` + `6-digit-random-number`
- Example: `FX20251028929833`

### Payment Method
- **Always set to COD** (Cash on Delivery) for bulk uploads
- Payment status set to `pending`

### Shipment Status
- **Initially set to `pending`** for all bulk uploaded shipments
- Can be updated later through status update endpoint

## ✅ Validation Rules

### Phone Number
- Must be 11 digits
- Must start with `01`
- Example: `01712345678`

### Weight
- Must be a positive decimal number
- Range: 0.1 kg to 50 kg
- Example: `1.5`, `2.5`, `10.0`

### COD Amount
- Must be a positive decimal number or 0
- Example: `2500.00`, `1500`, `0`

### Delivery Type
- Must be either `normal` or `express`
- Default: `normal` if not specified or invalid

### City Names
- Common cities: Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Mymensingh
- Can be any valid city name in Bangladesh

## 🔄 Processing Flow

1. **Request received** with CSV data
2. **Validation** of CSV format and data
3. **Parse CSV** rows (skip header)
4. **For each row:**
   - Validate columns count
   - Create shipment DTO
   - Calculate delivery fee
   - Generate AWB
   - Save to database
5. **Return results** with success/failure counts

## 🎯 Best Practices

1. **Validate CSV before upload** - Check format and required columns
2. **Test with small batches** - Start with 1-5 rows to verify
3. **Check response carefully** - Review errors array for failed rows
4. **Store AWB numbers** - Save returned AWB numbers for tracking
5. **Handle partial failures** - Some rows may succeed while others fail
6. **Use proper phone format** - Always use 11-digit format with `01` prefix
7. **Verify delivery types** - Use only `normal` or `express`

## 📖 Swagger Documentation

Visit the Swagger UI for interactive testing:

```
http://localhost:3001/api#/Shipments/ShipmentsController_bulkUpload
```

### Swagger Features:
- ✅ Pre-filled example request
- ✅ Interactive "Try it out" button
- ✅ Complete response schema
- ✅ All error codes documented
- ✅ Authorization header support

## 🚀 Quick Start

1. **Get your access token:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "merchant@example.com", "password": "yourpassword"}'
```

2. **Prepare your CSV data**

3. **Make the bulk upload request** with the token

4. **Check the response** for AWB numbers and any errors

5. **Verify shipments** using the AWB numbers

---

**Need help?** Check the API documentation or contact support.
