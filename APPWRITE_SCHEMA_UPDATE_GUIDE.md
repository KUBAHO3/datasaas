# Appwrite Collection Schema Update Guide

## Critical: Update `submission_values` Collection

The auto-import feature requires specific attributes in the `submission_values` collection to store form submission data properly. Follow these steps to add the missing attributes.

---

## Required Attributes to Add

Go to your Appwrite Console → Database → `submission_values` collection → Attributes, and add the following:

### 1. **fieldId** (String, Required)
- **Type**: String
- **Size**: 255
- **Required**: Yes
- **Array**: No
- **Default**: (none)

### 2. **fieldLabel** (String, Required)
- **Type**: String
- **Size**: 500
- **Required**: Yes
- **Array**: No
- **Default**: (none)

### 3. **fieldType** (String, Required)
- **Type**: String
- **Size**: 100
- **Required**: Yes
- **Array**: No
- **Default**: (none)

### 4. **valueText** (String, Optional)
- **Type**: String
- **Size**: 10000
- **Required**: No
- **Array**: No
- **Default**: (none)

### 5. **valueNumber** (Integer, Optional)
- **Type**: Integer
- **Min**: (none)
- **Max**: (none)
- **Required**: No
- **Array**: No
- **Default**: (none)

### 6. **valueBoolean** (Boolean, Optional)
- **Type**: Boolean
- **Required**: No
- **Array**: No
- **Default**: (none)

### 7. **valueDate** (String, Optional)
- **Type**: String
- **Size**: 100
- **Required**: No
- **Array**: No
- **Default**: (none)
- **Note**: Stores ISO 8601 date strings

### 8. **valueArray** (String Array, Optional)
- **Type**: String
- **Size**: 1000 (per item)
- **Required**: No
- **Array**: Yes
- **Default**: (none)
- **Note**: For multi-select, checkbox lists

### 9. **valueFileIds** (String Array, Optional)
- **Type**: String
- **Size**: 100 (per item)
- **Required**: No
- **Array**: Yes
- **Default**: (none)
- **Note**: Stores Appwrite file IDs for uploads

---

## Step-by-Step Instructions

### Via Appwrite Console (Web UI):

1. Log into your Appwrite Console
2. Navigate to **Databases** → Select your database
3. Find and click on the **`submission_values`** collection
4. Click the **Attributes** tab
5. For each attribute listed above:
   - Click **"Create Attribute"**
   - Select the appropriate type (String, Integer, Boolean)
   - Enter the attribute name exactly as shown (case-sensitive)
   - Set the size (for strings)
   - Set required/optional as specified
   - Check "Array" checkbox if specified
   - Click **"Create"**
6. Wait for each attribute to be created before adding the next

### Via Appwrite CLI (Alternative):

If you prefer using the Appwrite CLI, you can create attributes using these commands:

```bash
# String attributes
appwrite databases createStringAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId [SUBMISSION_VALUES_COLLECTION_ID] \
  --key fieldId \
  --size 255 \
  --required true

appwrite databases createStringAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId [SUBMISSION_VALUES_COLLECTION_ID] \
  --key fieldLabel \
  --size 500 \
  --required true

appwrite databases createStringAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId [SUBMISSION_VALUES_COLLECTION_ID] \
  --key fieldType \
  --size 100 \
  --required true

appwrite databases createStringAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId [SUBMISSION_VALUES_COLLECTION_ID] \
  --key valueText \
  --size 10000 \
  --required false

appwrite databases createStringAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId [SUBMISSION_VALUES_COLLECTION_ID] \
  --key valueDate \
  --size 100 \
  --required false

# Integer attribute
appwrite databases createIntegerAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId [SUBMISSION_VALUES_COLLECTION_ID] \
  --key valueNumber \
  --required false

# Boolean attribute
appwrite databases createBooleanAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId [SUBMISSION_VALUES_COLLECTION_ID] \
  --key valueBoolean \
  --required false

# Array attributes
appwrite databases createStringAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId [SUBMISSION_VALUES_COLLECTION_ID] \
  --key valueArray \
  --size 1000 \
  --required false \
  --array true

appwrite databases createStringAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId [SUBMISSION_VALUES_COLLECTION_ID] \
  --key valueFileIds \
  --size 100 \
  --required false \
  --array true
```

---

## Verify the Schema

After adding all attributes, verify your `submission_values` collection has:

### Core Fields (should already exist):
- ✅ `$id` (auto-generated)
- ✅ `$createdAt` (auto-generated)
- ✅ `$updatedAt` (auto-generated)
- ✅ `$permissions` (auto-generated)
- ✅ `submissionId` (String, required)
- ✅ `formId` (String, required)
- ✅ `companyId` (String, required)
- ✅ `status` (String, required)

### New Fields (to be added):
- ✅ `fieldId` (String, required)
- ✅ `fieldLabel` (String, required)
- ✅ `fieldType` (String, required)
- ✅ `valueText` (String, optional)
- ✅ `valueNumber` (Integer, optional)
- ✅ `valueBoolean` (Boolean, optional)
- ✅ `valueDate` (String, optional)
- ✅ `valueArray` (String[], optional)
- ✅ `valueFileIds` (String[], optional)

---

## How It Works

The submission value storage system uses **typed value fields** based on the field type:

| Field Type | Stored In |
|------------|-----------|
| `short_text`, `long_text`, `email`, `phone`, `url` | `valueText` |
| `number`, `currency` | `valueNumber` |
| `checkbox` (single) | `valueBoolean` |
| `date`, `datetime`, `time` | `valueDate` |
| `dropdown`, `radio` | `valueText` |
| `multi_select`, `checkbox` (multiple) | `valueArray` |
| `file_upload`, `image_upload` | `valueFileIds` |

This normalized structure allows:
- ✅ Efficient querying by field values
- ✅ Type-safe data storage
- ✅ Better database indexing
- ✅ Cleaner data model

---

## After Updating

Once you've added all the attributes:

1. ✅ The TypeScript errors should be resolved
2. ✅ The auto-import feature will work correctly
3. ✅ Form submissions will be stored properly
4. ✅ Data will display correctly in the data collection interface

Test the auto-import feature by:
1. Going to Data Collection page
2. Clicking "Auto-Import" button
3. Uploading a CSV/Excel file
4. Creating a form and importing data
5. Verifying the data appears correctly in the table

---

## Troubleshooting

**Error: "Unknown attribute: fieldId"**
- Make sure you added the `fieldId` attribute and it's created successfully

**Error: "Invalid document structure"**
- Check that all required attributes (`fieldId`, `fieldLabel`, `fieldType`) are set to required

**Data not displaying**
- Verify the permissions are set correctly on the collection
- Check that the typed value fields (`valueText`, `valueNumber`, etc.) exist

**Import stuck or failing**
- Check browser console for detailed error messages
- Verify file size is under 10MB
- Ensure CSV/Excel file has valid column headers

---

## Need Help?

If you encounter issues:
1. Check the Appwrite Console logs
2. Check browser console for errors
3. Verify all attributes are created with correct types and names (case-sensitive)
4. Ensure the collection has proper permissions set for your team
