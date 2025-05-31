# Dashboard Contact Form Endpoint Documentation

This document explains the functionality of a POST endpoint designed for a dashboard template to handle contact form submissions. The endpoint allows users to send messages with their name, email, message content, and an optional priority level, which can be integrated into other websites with contact forms.

## Endpoint Overview

**Route**: `POST /api/new`

**Purpose**: Processes and stores contact form submissions from users, including their name, email, message, and priority.

**Middleware**:

- `limiter`: Rate-limiting middleware to prevent abuse and limit the number of requests from a single source.

## Code Explanation

Below is the implementation of the endpoint:

```javascript
router.post("/new", limiter, async (req, res) => {
    const { name, email, message, priority } = req.body;
    try {
        const newMsg = new Message({
            name,
            email,
            message,
            priority
        });

        await newMsg.save();
        res.send("working");
    } catch (error) {
        console.log(error);
    }
});
```

### Breakdown

1. **Route Definition**:

   - The endpoint is defined as a `POST` request to `/new`.
   - The `limiter` middleware is applied to restrict excessive requests, enhancing security.

2. **Request Body**:

   - The endpoint expects a JSON payload with the following fields:
     - `name`: The sender's name (string).
     - `email`: The sender's email address (string).
     - `message`: The content of the message (string).
     - `priority`: An optional field to indicate the message's priority (e.g., low, medium, high).

3. **Processing**:

   - The request body is destructured to extract `name`, `email`, `message`, and `priority`.
   - A new `Message` object is created using a presumed `Message` model (e.g., Mongoose schema for MongoDB).
   - The `newMsg` object is saved to the database using `await newMsg.save()`.

4. **Response**:

   - On successful save, the endpoint responds with the string `"working"`.
   - If an error occurs, it is logged to the console, but no response is sent to the client (consider adding an error response for better user feedback).

## Integration Instructions

To integrate this endpoint into another website with a contact form:

1. **Form Setup**:

   - Create an HTML form with fields for `name`, `email`, `message`, and optionally `priority`.

   - Example:

     ```html
     <form action="https://your-dashboard-api.com/api/new" method="POST">
         <input type="text" name="name" placeholder="Your Name" required>
         <input type="email" name="email" placeholder="Your Email" required>
         <textarea name="message" placeholder="Your Message" required></textarea>
         <select name="priority">
             <option value="low">Low</option>
             <option value="medium">Medium</option>
             <option value="high">High</option>
         </select>
         <button type="submit">Send</button>
     </form>
     ```

2. **API Request**:

   - Ensure the form's `action` attribute points to the deployed endpoint URL (e.g., `https://your-dashboard-api.com/new`).
   - The form data will be sent as a JSON payload or form-encoded data, depending on your frontend setup.

3. **Dependencies**:

   - The backend requires a `Message` model (e.g., a Mongoose schema for MongoDB) with fields for `name`, `email`, `message`, and `priority`.

   - Example Mongoose schema:

     ```javascript
     const mongoose = require('mongoose');
     const messageSchema = new mongoose.Schema({
         name: { type: String, required: true },
         email: { type: String, required: true },
         message: { type: String, required: true },
         priority: { type: String, default: 'medium' }
     });
     const Message = mongoose.model('Message', messageSchema);
     ```

4. **Rate Limiting**:

   - The `limiter` middleware (e.g., `express-rate-limit`) must be configured to control request rates.

   - Example configuration:

     ```javascript
     const rateLimit = require('express-rate-limit');
     const limiter = rateLimit({
         windowMs: 15 * 60 * 1000, // 15 minutes
         max: 100 // Limit each IP to 100 requests per window
     });
     ```

## Recommendations

- **Error Handling**: Modify the endpoint to return an error response (e.g., `res.status(500).send("Error saving message")`) instead of just logging errors to improve user experience.
- **Validation**: Add input validation to ensure `name`, `email`, and `message` are valid and `priority` is within acceptable values (e.g., 'low', 'medium', 'high').
- **CORS**: If integrating with external websites, enable CORS on the server to allow cross-origin requests.
- **Security**: Sanitize inputs to prevent injection attacks and consider adding CAPTCHA to reduce spam.

## Example Usage

Send a POST request to the endpoint using a tool like `curl` or a frontend form:

```bash
curl -X POST https://your-dashboard-api.com/api/new \
-H "Content-Type: application/json" \
-d '{"name":"John Doe","email":"john@example.com","message":"Hello!","priority":"high"}'
```

**Expected Response**:

```
working
```

This endpoint provides a simple and effective way to collect and store contact form submissions for your dashboard application.
