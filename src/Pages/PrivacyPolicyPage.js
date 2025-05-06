import React, { useState, useEffect } from "react";

const PrivacyPolicyPage = () => {
  const [privacyPolicy, setPrivacyPolicy] = useState(null);

  // Dummy data for the privacy policy
  const dummyData = {
    title: "Privacy Policy",
    content: `This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our services. We value your privacy and are committed to protecting your personal data. Our policy includes details about the information we collect, how we use it, and your rights regarding your information.

    1. **Information Collection**: We collect personal data such as name, email address, phone number, etc.
    2. **Use of Information**: We use your information to provide and improve our services.
    3. **Sharing Information**: We may share your information with third-party partners to enhance our services.
    4. **Security**: We take necessary measures to ensure your data is protected from unauthorized access or disclosure.
    
    By using our services, you agree to the collection and use of your information in accordance with this policy.`,
    date: "2025-05-05",
  };

  // Simulate a data fetch (e.g., from an API) after the component mounts
  useEffect(() => {
    setPrivacyPolicy(dummyData);
  }, []);

  if (!privacyPolicy) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-semibold text-blue-900 mb-4">{privacyPolicy.title}</h2>
      <p className="text-sm text-gray-500 mb-4">Effective Date: {privacyPolicy.date}</p>

      <div className="text-gray-700 leading-relaxed text-lg space-y-4">
        <p>{privacyPolicy.content}</p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
