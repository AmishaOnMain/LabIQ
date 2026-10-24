function evaluateTriageLevel(metrics) {
  let hasAbnormal = false;
  let hasCritical = false;

  for (const metric of metrics) {
    const { status, value, referenceMin, referenceMax } = metric;

    if (status === "CRITICAL_HIGH" || status === "CRITICAL_LOW") {
      hasCritical = true;
    } else if (status === "ELEVATED" || status === "LOW") {
      hasAbnormal = true;
    }

    if (referenceMax !== null && value > referenceMax * 1.5) {
      hasCritical = true;
    }
    if (referenceMin !== null && value < referenceMin * 0.5) {
      hasCritical = true;
    }
  }

  if (hasCritical) return "URGENT";
  if (hasAbnormal) return "ATTENTION_NEEDED";
  return "ROUTINE";
}

module.exports = { evaluateTriageLevel };
