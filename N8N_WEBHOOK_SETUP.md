# n8n Webhook Setup for Agent Creation

This guide explains how to set up the n8n webhook for creating ElevenLabs agents from VoiceDesk.

## Webhook URL

Configure your n8n webhook URL in `.env` with the **complete webhook path**:
```
VITE_N8N_BASE_URL=https://your-n8n-instance.com/webhook/create-agent
```

**Important:** Include the full webhook URL. The application will use this URL directly.

## Request Format

The webhook receives a POST request with the following JSON body:

```json
{
  "name": "Business Voice Agent",
  "prompt": "You are a helpful voice assistant for this business."
}
```

### Fields:
- `name` (string, required): The name for the new agent
- `prompt` (string, required): System prompt for the agent

## Response Format

The webhook should return a JSON response with:

```json
{
  "agentId": "agent_xxxxxxxxxxxxx",
  "message": "Agent created successfully"
}
```

### Response Fields:
- `agentId` or `agent_id` (string, required): The ElevenLabs agent ID
- `message` (string, optional): Success message

**Note:** The application accepts both `agentId` (camelCase) and `agent_id` (snake_case) formats.

## CORS Configuration

**CRITICAL:** Your n8n webhook MUST return CORS headers to allow browser requests.

In your n8n webhook response, include these headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

You can add these in the "Respond to Webhook" node under "Options" > "Response Headers".

## n8n Workflow Example

Your n8n workflow should:

1. **Webhook Node**: Listen for POST requests at your webhook path
   - Enable "Respond Immediately" or add a proper response at the end
2. **HTTP Request Node**: Call ElevenLabs API to create the agent
   - Method: POST
   - URL: `https://api.elevenlabs.io/v1/convai/agents`
   - Headers:
     - `xi-api-key`: Your ElevenLabs API key (configured in n8n)
     - `Content-Type`: `application/json`
   - Body:
     ```json
     {
       "conversation_config": {
         "agent": {
           "prompt": {
             "prompt": "{{$json.body.prompt}}"
           },
           "first_message": "Hello! How can I help you today?",
           "language": "en"
         },
         "asr": {
           "provider": "elevenlabs",
           "model": "eleven_multilingual_v2"
         },
         "tts": {
           "provider": "elevenlabs",
           "voice_id": "Rachel"
         }
       },
       "platform_settings": {
         "widget": {
           "avatar": {
             "type": "orb"
           }
         }
       },
       "name": "{{$json.body.name}}"
     }
     ```
3. **Function Node**: Extract and format the response
   ```javascript
   return {
     json: {
       agentId: $input.item.json.agent_id
     }
   };
   ```
4. **Respond to Webhook Node**: Return the formatted response

## Error Handling

If the agent creation fails, return a 500 status with:
```json
{
  "error": "Error message here"
}
```

## Testing

You can test your webhook using curl:

```bash
curl -X POST https://your-n8n-instance.com/webhook/create-agent \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "prompt": "You are a test agent."
  }'
```

Expected response:
```json
{
  "agentId": "agent_xxxxxxxxxxxxx"
}
```

## Notes

- **CORS is required**: Make sure your n8n webhook returns proper CORS headers (see CORS Configuration section above)
- Voice selection and ElevenLabs API key should be configured directly in your n8n workflow
- This keeps credentials secure within n8n instead of passing them from the client
- The default voice is set to "Rachel" but you can change this in your n8n workflow configuration

## Troubleshooting

### CORS Error
If you see "No 'Access-Control-Allow-Origin' header" error:
1. Add CORS headers to your "Respond to Webhook" node in n8n
2. Make sure the headers include:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: POST, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type`

### Wrong URL
If the webhook isn't being called:
1. Check that your `.env` has the complete webhook URL including the path
2. Example: `VITE_N8N_BASE_URL=https://n8n.example.com/webhook/create-agent`

### "No agent ID returned" Error
If you see "No agent ID in response" error:
1. Open the browser console (F12) to see the actual response from your webhook
2. Check that your n8n workflow is returning a JSON response
3. Verify the response includes either `agentId` or `agent_id` field
4. Common issues:
   - The "Respond to Webhook" node isn't configured properly
   - The response body is empty or not JSON format
   - The ElevenLabs API call failed but the workflow still returned success
   - The field name is misspelled (should be `agentId` or `agent_id`)

Example of a correct "Respond to Webhook" node configuration:
- Response Code: 200
- Response Body: `{ "agentId": "{{ $json.agent_id }}" }`
- Response Headers: Include CORS headers (see above)
