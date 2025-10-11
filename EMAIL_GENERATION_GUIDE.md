# 🧙‍♂️ AI Email Generation for Professor Management

The PhD Tracker now includes AI-powered email generation to help you craft professional academic emails when contacting professors.

## ✨ Features

- **AI-Powered Generation**: Uses OpenAI GPT or Google Gemini to create personalized emails
- **Multiple Email Types**: Initial inquiry, follow-up, meeting request, thank you emails
- **Smart Personalization**: Automatically includes professor and student information
- **Template Fallback**: Works even without AI keys using professional templates
- **Copy & Send**: Easy copying or direct email client integration

## 🚀 How to Use

### 1. **Access Email Generator**
- Go to the **Professor Management** page
- Find any professor card
- Click the purple **"AI Email"** button

### 2. **Configure Your Email**
- **Email Type**: Choose from initial inquiry, follow-up, meeting request, or thank you
- **Your Information**: Name, university, and degree level (auto-filled from profile)
- **Research Interests**: Add relevant keywords for better personalization
- **Custom Instructions**: Optional specific details to include

### 3. **Generate & Use**
- Click **"Generate Email"** to create your personalized email
- **Copy** subject/body separately or all together
- **"Open in Email Client"** to launch your default email app
- **Regenerate** if you want a different version

## 🔧 Setup AI APIs (Optional)

### Option 1: OpenAI GPT
1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add to your `.env` file:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=sk-your_key_here
   ```

### Option 2: Google Gemini
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to your `.env` file:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
   ```

### Fallback Templates
Without API keys, the system uses professional email templates with smart placeholders.

## 📧 Email Types Explained

### 🔹 **Initial Inquiry**
- First contact with a professor
- Introduces your research interests
- Requests information about opportunities

### 🔹 **Follow-up Email**
- Following up on previous correspondence
- Gentle reminder of your interest
- Professional persistence

### 🔹 **Meeting Request**
- Requesting a video call or in-person meeting
- Suggesting time slots
- Professional scheduling

### 🔹 **Thank You Note**
- After meetings or conversations
- Expressing gratitude
- Reinforcing your interest

## 💡 Tips for Best Results

### 🎯 **Personalization**
- Fill in research interests that match the professor's work
- Include specific details in custom instructions
- Review and edit generated emails before sending

### 📝 **Custom Instructions Examples**
- "Mention my publication in ICML 2024"
- "Reference their recent Nature paper on quantum computing"
- "Include my fellowship award from NSF"
- "Mention the January 2025 application deadline"

### ✅ **Best Practices**
- Always review generated content before sending
- Customize with specific details about the professor's research
- Keep emails concise and professional
- Follow up appropriately (typically after 1-2 weeks)

## 🛠️ Troubleshooting

### Email Generation Failed
- **Check API Keys**: Ensure they're correctly added to `.env`
- **Try Templates**: Toggle off AI mode to use template fallback
- **Check Network**: Ensure internet connection for API calls

### Poor Email Quality
- **Add Research Keywords**: More specific interests = better emails
- **Use Custom Instructions**: Add specific details you want included
- **Try Different Email Types**: Each type has different tone and content

### API Costs
- **OpenAI**: ~$0.001-0.002 per email (very affordable)
- **Gemini**: Often has free tier with generous limits
- **Templates**: Always free as fallback option

## 🔄 Quick Workflow

1. **Research Professor** → Add to your database with notes
2. **Click "AI Email"** → Opens generator with professor info
3. **Configure Settings** → Add your details and preferences
4. **Generate** → AI creates personalized email
5. **Review & Edit** → Make any final adjustments
6. **Send** → Copy to email client or use direct mailto link
7. **Update Status** → Mark professor as "contacted" with date

## 🚀 Future Enhancements

- **Email Templates Library**: Save and reuse successful email patterns
- **Response Tracking**: Track reply rates and optimize
- **Multi-language Support**: Generate emails in different languages
- **Research Integration**: Automatically pull professor's recent publications
- **Follow-up Scheduling**: Automated reminders for follow-ups

---

**Happy Email Crafting! 📧✨**

The AI email generator helps you maintain professional communication while saving time and ensuring you don't miss important details in your academic outreach.