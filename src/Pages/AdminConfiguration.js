import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API = "https://api.redemly.com/api/admin/referral-settings";

const AdminConfiguration = () => {
  const [form, setForm] = useState({
    referredUserCoupons: 0,
    referrerUserCoupons: 0,
    registrationCoupons: 0,
    isReferralEnabled: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ GET SETTINGS
  const fetchSettings = async () => {
    try {
      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (res.data?.referralSettings) {
        setForm(res.data.referralSettings);
      }
    } catch {
      toast.error("Failed to load referral settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ✅ HANDLE INPUT
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  // ✅ SAVE SETTINGS
  const handleSave = async () => {
    try {
      setSaving(true);

      await axios.post(API, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      toast.success("Referral settings saved 🎉");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Skeleton Loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="animate-pulse space-y-4 w-[500px]">
          <div className="h-10 bg-purple-200 rounded"></div>
          <div className="h-32 bg-purple-200 rounded"></div>
          <div className="h-12 bg-purple-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-6 md:p-10">
      <Toaster position="top-right" />

      {/* CARD */}
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl border border-purple-100 shadow-2xl rounded-3xl p-8 md:p-12">
        
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Referral Configuration
          </h1>

          <p className="text-gray-500 mt-2">
            Control referral rewards and onboarding coupons.
          </p>
        </div>

        {/* FORM GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              label: "Referred User Coupons",
              name: "referredUserCoupons",
            },
            {
              label: "Referrer User Coupons",
              name: "referrerUserCoupons",
            },
            {
              label: "Registration Coupons",
              name: "registrationCoupons",
            },
          ].map((item) => (
            <div key={item.name} className="space-y-2">
              <label className="font-semibold text-gray-700">
                {item.label}
              </label>

              <input
                type="number"
                name={item.name}
                value={form[item.name]}
                min={0}
                onChange={handleChange}
                className="
                  w-full
                  px-4 py-3
                  rounded-xl
                  border
                  border-gray-200
                  focus:border-[#9D4DFF]
                  focus:ring-4
                  focus:ring-purple-100
                  outline-none
                  transition
                "
              />
            </div>
          ))}
        </div>

        {/* TOGGLE */}
        <div className="mt-10 flex items-center justify-between bg-purple-50 p-6 rounded-2xl">
          <div>
            <h3 className="font-bold text-lg text-gray-800">
              Enable Referral Program
            </h3>

            <p className="text-gray-500 text-sm">
              Allow users to earn rewards through referrals.
            </p>
          </div>

          {/* PREMIUM TOGGLE */}
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              name="isReferralEnabled"
              checked={form.isReferralEnabled}
              onChange={handleChange}
              className="peer sr-only"
            />

            <div
              className="
              h-8 w-14 rounded-full bg-gray-300
              peer-checked:bg-[#9D4DFF]
              transition
            "
            ></div>

            <div
              className="
              absolute left-1 top-1
              h-6 w-6 rounded-full bg-white shadow-md
              transition
              peer-checked:translate-x-6
            "
            ></div>
          </label>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="
            mt-10
            w-full
            py-4
            rounded-2xl
            font-semibold
            text-white
            text-lg
            bg-[#9D4DFF]
            hover:scale-[1.02]
            active:scale-[0.98]
            transition
            shadow-lg
            disabled:opacity-70
          "
        >
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
};

export default AdminConfiguration;
