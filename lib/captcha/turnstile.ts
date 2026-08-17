export async function verifyTurnstileToken(token?: string, remoteIp?: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If Turnstile secret key is not set or placeholder, bypass for local dev
  if (!secretKey || secretKey.includes("XXXXXXXXXXXXX") || secretKey === "dummy") {
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "CAPTCHA token missing. Please complete the CAPTCHA." };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    const data = await response.json();
    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: "CAPTCHA verification failed. Please try again." };
    }
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return { success: false, error: "Server failed to verify CAPTCHA." };
  }
}
