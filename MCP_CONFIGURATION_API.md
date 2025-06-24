# MCP Configuration API

## Overview

The MCP configuration system sends configuration data to the `mcp/configuration` API endpoint using a standardized payload structure that includes server metadata, authentication headers, and allowed tools list.

## API Endpoint

**POST** `https://botsify.com/api/mcp/configuration`

## New Payload Structure

The `sendMCPConfigurationJSON` method now sends the following standardized payload structure:

### Payload Fields
- `type`: Always set to "mcp" to identify the configuration type
- `server_label`: Unique identifier/label for the MCP server (e.g., "stripe", "github")
- `server_url`: The MCP server endpoint URL
- `headers`: Object containing authentication headers based on the server's auth method
- `allowed_tools`: Array of specific tool names that the MCP server provides
- `require_approval`: Approval setting, typically set to "never"

## Example Payload: Stripe Integration

```json
{
  "type": "mcp",
  "server_label": "stripe",
  "server_url": "https://mcp.stripe.com",
  "headers": {
    "Authorization": "Bearer sk_test_1234567890abcdef1234567890abcdef12345678"
  },
  "allowed_tools": [
    "search_documentation",
    "get_stripe_account_info",
    "create_customer",
    "list_customers",
    "create_product",
    "list_products",
    "create_price",
    "list_prices",
    "create_payment_link",
    "create_invoice",
    "list_invoices",
    "create_invoice_item",
    "finalize_invoice",
    "retrieve_balance",
    "create_refund",
    "list_payment_intents",
    "list_subscriptions",
    "cancel_subscription",
    "update_subscription",
    "list_coupons",
    "create_coupon",
    "update_dispute",
    "list_disputes"
  ],
  "require_approval": "never"
}
```

## Headers Configuration

The `headers` object is dynamically built based on the authentication method:

### Bearer Token (Stripe, Slack, Notion, OAuth)
```json
{
  "Authorization": "Bearer your_token_here"
}
```

### GitHub Token
```json
{
  "Authorization": "token ghp_your_github_token"
}
```

### Notion API
```json
{
  "Authorization": "Bearer secret_notion_token",
  "Notion-Version": "2022-06-28"
}
```

### Basic Authentication
```json
{
  "Authorization": "Basic base64_encoded_credentials"
}
```

### Generic API Key
```json
{
  "X-API-Key": "your_api_key_here"
}
```

## Tool Mapping

Features from the MCP server configuration are automatically mapped to specific tool names:

### Stripe Tools
- **Payment processing** → `create_payment_intent`, `capture_payment`, `list_payment_intents`
- **Customer management** → `create_customer`, `list_customers`, `update_customer`, `get_customer`
- **Subscription billing** → `create_subscription`, `list_subscriptions`, `update_subscription`, `cancel_subscription`
- **Product management** → `create_product`, `list_products`, `update_product`, `create_price`, `list_prices`
- **Invoice management** → `create_invoice`, `list_invoices`, `create_invoice_item`, `finalize_invoice`
- **Financial reporting** → `retrieve_balance`, `list_transactions`
- **Refund processing** → `create_refund`, `list_refunds`
- **Dispute handling** → `update_dispute`, `list_disputes`
- **Payment links** → `create_payment_link`
- **Coupon management** → `create_coupon`, `list_coupons`

### GitHub Tools
- **Repository access** → `list_repositories`, `get_repository`, `search_repositories`
- **Issue management** → `list_issues`, `create_issue`, `update_issue`, `close_issue`
- **Pull requests** → `list_pull_requests`, `create_pull_request`, `merge_pull_request`
- **Code search** → `search_code`, `get_file_content`

### Other Service Tools
Similar mapping exists for Shopify, Notion, Slack, Google Drive, PayPal, Square, Plaid, and Zapier.

## Implementation

The updated `sendMCPConfigurationJSON` method in `src/services/botsifyApi.ts`:

```typescript
async sendMCPConfigurationJSON(mcpData: any): Promise<BotsifyResponse> {
  const mcpPayload = {
    type: "mcp",
    server_label: mcpData.serverId || mcpData.serverName?.toLowerCase().replace(/\s+/g, '_'),
    server_url: mcpData.connectionUrl || this.getDefaultServerUrl(mcpData.serverId),
    headers: this.buildMCPHeaders(mcpData),
    allowed_tools: this.mapFeaturesToTools(mcpData.features || []),
    require_approval: "never"
  };
  
  const response = await axios.post(`${BOTSIFY_BASE_URL}/mcp/configuration`, mcpPayload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  });
  
  return { success: true, message: 'MCP configuration sent successfully', data: response.data };
}
```

## Server Label Generation

Server labels are automatically generated from:
1. `serverId` if available (preferred)
2. `serverName` converted to lowercase with spaces replaced by underscores

Examples:
- "Stripe" → "stripe"
- "Google Drive" → "google_drive"
- "Custom API Server" → "custom_api_server"

## Default Server URLs

Built-in mappings for popular services:
- **stripe**: `https://mcp.stripe.com`
- **github**: `https://api.github.com`
- **notion**: `https://api.notion.com/v1`
- **slack**: `https://slack.com/api`
- **shopify**: `https://api.shopify.com`
- **google-drive**: `https://www.googleapis.com/drive/v3`
- **paypal**: `https://api.paypal.com`
- **square**: `https://connect.squareup.com`
- **plaid**: `https://production.plaid.com`
- **zapier**: `https://zapier.com/api/v1`

## Usage

The configuration is automatically sent when:
1. A user successfully connects to an MCP server through the UI
2. The MCP server connection is validated
3. The connection is saved locally

The new payload structure ensures:
- **Standardized format** across all MCP servers
- **Proper authentication** with service-specific headers
- **Granular tool permissions** with specific tool names
- **Clear server identification** with unique labels
- **Consistent approval settings** for tool usage

## Migration from Old Format

The old format with `serverName`, `apiKey`, `availableTools`, and `prompt` has been replaced with the new standardized structure. The system automatically:

1. **Converts server names** to server labels
2. **Builds proper headers** from API keys and auth methods
3. **Maps features** to specific tool names
4. **Sets default URLs** for known services
5. **Maintains backwards compatibility** during the transition 