# Contact Form Setup Guide

## Quick Setup (5 minutes)

Your contact form is ready to work! You just need to connect it to Formspree (free email service).

---

## Step-by-Step Instructions

### Step 1: Create Formspree Account

1. **Go to Formspree**: https://formspree.io
2. **Click "Sign Up"** (top right)
3. **Choose sign-up method**:
   - Use Google (fastest)
   - Or use email/password
4. **Verify your email** if needed

### Step 2: Create Your Form

1. **After logging in**, you'll see the dashboard
2. **Click "New Form"** button (usually top right or center)
3. **Form Name**: Enter "Crazy Comfort Contact Form"
4. **Click "Create"** or "Next"

### Step 3: Get Your Form Endpoint

1. **After creating the form**, you'll see your form details
2. **Look for "Endpoint"** or "Form URL"
3. **It will look like**: `https://formspree.io/f/xpzqkqpn`
4. **Copy the entire URL** (or just the ID part like `xpzqkqpn`)

### Step 4: Update Your Website

1. **Open** `index.html` in your code editor
2. **Find line 1067** (search for "YOUR_FORM_ID")
3. **Replace** `YOUR_FORM_ID` with your actual Formspree form ID

**Example:**
- **Before**: `action="https://formspree.io/f/YOUR_FORM_ID"`
- **After**: `action="https://formspree.io/f/xpzqkqpn"` (use YOUR actual ID)

### Step 5: Configure Email Notifications

1. **In Formspree dashboard**, go to your form settings
2. **Add email**: `ez@crazycomfort.com`
3. **Enable email notifications**
4. **Save settings**

### Step 6: Test Your Form

1. **Rebuild your site**: Run `npm run build`
2. **Open your website** in a browser
3. **Fill out the contact form** with test data
4. **Submit the form**
5. **Check your email** (`ez@crazycomfort.com`) for the submission

---

## What You'll Receive

When someone submits the form, you'll get an email with:
- **Name**
- **Email** (you can reply directly)
- **Phone**
- **Service Needed**
- **Message**

---

## Formspree Free Tier

- ✅ **50 submissions per month** (free)
- ✅ **Email notifications**
- ✅ **Spam protection**
- ✅ **Form data stored in dashboard**
- ✅ **No credit card required**

---

## Troubleshooting

### Form not sending?
- Check that you replaced `YOUR_FORM_ID` with your actual ID
- Make sure you ran `npm run build` after updating
- Check browser console for errors (F12)

### Not receiving emails?
- Check spam folder
- Verify email in Formspree settings
- Check Formspree dashboard for submissions

### Need more submissions?
- Formspree paid plans start at $10/month
- Or use alternative: EmailJS (also free)

---

## Alternative: EmailJS Setup

If you prefer EmailJS instead:

1. Go to https://www.emailjs.com
2. Sign up (free)
3. Create email service (Gmail, Outlook, etc.)
4. Get your Public Key and Service ID
5. Update form to use EmailJS

---

## Current Form Status

✅ Form HTML: Ready
✅ JavaScript: Working
✅ Styling: Complete
⏳ Formspree Setup: Needs your form ID

---

## Need Help?

If you get stuck:
1. Check Formspree documentation: https://help.formspree.io
2. Make sure your form ID is correct
3. Verify you ran `npm run build` after changes

