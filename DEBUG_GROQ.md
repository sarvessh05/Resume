# Debug Groq API Issues

## The Error
`Error: Failed to parse AI response`

This means the Groq API returned a response that couldn't be parsed as JSON.

## What I Fixed

1. **Added JSON mode**: `response_format: { type: 'json_object' }` forces Groq to return valid JSON
2. **Better parsing**: Removes markdown code blocks and handles various formats
3. **Fallback response**: If parsing fails, returns a default "Review" recommendation
4. **Better logging**: Console logs show exactly what Groq returned
5. **Improved PDF parsing**: Better text extraction from PDF files

## How to Test

### Option 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Upload a resume
4. Look for these logs:
   - `Extracted X characters from filename.pdf`
   - `Groq AI Response: {...}`
   - `Analysis complete for filename.pdf`

### Option 2: Test with Simple Text Resume
Create a text file named `test-resume.txt`:
```
John Doe
john@example.com
555-1234

EXPERIENCE
Senior Developer at Tech Corp (2020-2024)
- React, TypeScript, Node.js
- Led team of 5 developers

EDUCATION
BS Computer Science, MIT

SKILLS
React, TypeScript, JavaScript, Node.js, Python
```

Save as PDF and upload.

## Common Issues

### Issue 1: PDF Text Extraction Fails
**Symptom**: "Insufficient text extracted from PDF"
**Solution**: 
- Use a text-based PDF (not scanned image)
- Try converting to DOCX
- Or use a simpler PDF

### Issue 2: Groq API Rate Limit
**Symptom**: API errors after multiple uploads
**Solution**: Wait a minute between batches

### Issue 3: Invalid JSON from Groq
**Symptom**: Parse errors even with json_object mode
**Solution**: The code now has fallback - will show "Review" status

## Manual Test of Groq API

You can test the Groq API directly in browser console:

```javascript
// Test Groq API
const testGroq = async () => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Respond with JSON only.' },
        { role: 'user', content: 'Return this JSON: {"test": "success"}' }
      ],
      response_format: { type: 'json_object' }
    })
  });
  const data = await response.json();
  console.log('Groq Response:', data);
};

testGroq();
```

## What Should Happen Now

1. ✅ Upload resume
2. ✅ Text extracted (check console)
3. ✅ Groq analyzes (check console for response)
4. ✅ If parsing fails, uses fallback
5. ✅ Candidate saved with "Review" status
6. ✅ You can manually review the candidate

## Still Not Working?

Check these:
1. Is Groq API key valid? (Check .env file)
2. Is there a rate limit? (Wait 1 minute)
3. Is the PDF readable? (Try a different file)
4. Check browser console for exact error

The system now has multiple fallbacks, so it should at least save the candidate even if AI analysis partially fails.
