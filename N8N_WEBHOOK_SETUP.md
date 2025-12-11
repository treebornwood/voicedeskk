# n8n Webhook Setup for Agent Creation

This guide explains how to set up the n8n webhook for creating ElevenLabs agents from VoiceDesk.

## Webhook URL

Configure your n8n webhook URL in `.env`:
```
VITE_N8N_BASE_URL=https://your-n8n-instance.com
```

## Webhook Endpoint

The webhook should be accessible at:
```
POST {VITE_N8N_BASE_URL}/webhook/create-agent
```

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
- `agentId` (string, required): The ElevenLabs agent ID
- `message` (string, optional): Success message

## n8n Workflow Example

Your n8n workflow should:

1. **Webhook Node**: Listen for POST requests at `/webhook/create-agent`
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

- Voice selection and ElevenLabs API key should be configured directly in your n8n workflow
- This keeps credentials secure within n8n instead of passing them from the client
- The default voice is set to "Rachel" but you can change this in your n8n workflow configuration
