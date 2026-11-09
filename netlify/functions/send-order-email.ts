// Netlify Serverless Function for Email Notification via EmailJS
export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const templateParams = JSON.parse(event.body || "{}");
    const emailServiceId = "service_1tvp2rk";
    const emailTemplateId = "Template_0vqd26h";
    const emailPublicKey = "Qi5oXZpEMJkG2utos";

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        service_id: emailServiceId,
        template_id: emailTemplateId,
        user_id: emailPublicKey,
        template_params: templateParams
      })
    });

    const text = await response.text().catch(() => "");

    return {
      statusCode: response.ok ? 200 : 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: response.ok, message: text })
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Email dispatch failed" })
    };
  }
};
