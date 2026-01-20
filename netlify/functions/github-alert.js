const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL; // Set in Netlify env vars

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };
  
  const payload = JSON.parse(event.body);
  const alert = payload.alert || payload.alerts?.[0];
  
  if (!alert) return { statusCode: 200 };
  
  const message = {
    text: `🛑 *Security Alert*\nSeverity: *${alert.severity.toUpperCase()}*\nRule: ${alert.rule.severity}\nLocation: ${alert.instances[0]?.location?.path}:${alert.instances[0]?.location?.start.line}\n${alert.most_recent_instance.created_at}`,
    attachments: [{ color: alert.severity === 'critical' ? 'danger' : 'warning', text: alert.message?.text }]
  };
  
  await fetch(SLACK_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
  
  return { statusCode: 200 };
};
