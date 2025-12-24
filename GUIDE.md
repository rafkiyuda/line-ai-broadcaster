# How to Get LINE Group ID

To send messages to a group, you need its `groupId`. Here is how to find it using this project:

1. **Deploy the Project**
   - Deploy this code to Vercel, Railway, or Render.
   - You will get a production URL, e.g., `https://line-blasting.vercel.app`.

2. **Configure Webhook**
   - Go to the [LINE Developers Console](https://developers.line.biz/).
   - Select your channel.
   -  Messaging API tab > **Webhook settings**.
   - Input your Webhook URL: `https://<your-app-domain>/api/webhook`.
   - Enable "Use webhook".

3. **Get the ID**
   - Add your LINE Bot to the target group.
   - Send a text message (e.g., "Check ID") in that group.
   - Check your application logs (e.g., Vercel Function Logs).
   - Look for the log entry **"Received Webhook Payload"**.
   - Inside the JSON, find the `source` object:
     ```json
     "source": {
       "type": "group",
       "groupId": "Cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
     }
     ```
   - Copy the string starting with `C`. This is your `groupId`.
