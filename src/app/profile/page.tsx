'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    fullName: '',
    username: '',
    recoveryEmail: '',
    phoneNumber: '',
    department: '',
    positionTitle: '',
    accountCreated: '',
    lastLogin: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: save to backend
    console.log('Profile data to save:', profileData);
  };

  const handleCancel = () => {
    // TODO: restore original values if applicable
    console.log('Changes cancelled');
  };

  const clearPlaceholder = (e: React.FocusEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.placeholder = '';
  };
  const restorePlaceholderIfEmpty = (e: React.FocusEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) => {
    const target = e.currentTarget as HTMLInputElement;
    if (!target.value) {
      target.placeholder = target.dataset.example ?? '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Full-bleed card: stretches the whole page width. Inner padding keeps content readable. */}
      <div className="w-full">
        <div className="bg-white shadow border-2 border-teal-500">
          <div className="px-8 md:px-16 lg:px-24 py-10">
            <h1 className="text-3xl font-semibold text-gray-900 mb-8">Profile Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={profileData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  data-example="e.g., John Doe"
                  onFocus={clearPlaceholder}
                  onBlur={restorePlaceholderIfEmpty}
                  onMouseEnter={clearPlaceholder}
                  onMouseLeave={restorePlaceholderIfEmpty}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 px-4 py-2 text-base"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={profileData.username}
                  onChange={handleInputChange}
                  placeholder="e.g., johndoe123"
                  data-example="e.g., johndoe123"
                  onFocus={clearPlaceholder}
                  onBlur={restorePlaceholderIfEmpty}
                  onMouseEnter={clearPlaceholder}
                  onMouseLeave={restorePlaceholderIfEmpty}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 px-4 py-2 text-base"
                />
              </div>

              <div>
                <label htmlFor="recoveryEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Recovery Email
                </label>
                <input
                  id="recoveryEmail"
                  name="recoveryEmail"
                  type="email"
                  value={profileData.recoveryEmail}
                  onChange={handleInputChange}
                  placeholder="e.g., youremail@example.com"
                  data-example="e.g., youremail@example.com"
                  onFocus={clearPlaceholder}
                  onBlur={restorePlaceholderIfEmpty}
                  onMouseEnter={clearPlaceholder}
                  onMouseLeave={restorePlaceholderIfEmpty}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 px-4 py-2 text-base"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., +1 (555) 555-5555"
                  data-example="e.g., +1 (555) 555-5555"
                  onFocus={clearPlaceholder}
                  onBlur={restorePlaceholderIfEmpty}
                  onMouseEnter={clearPlaceholder}
                  onMouseLeave={restorePlaceholderIfEmpty}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 px-4 py-2 text-base"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={profileData.department}
                  onChange={handleInputChange}
                  placeholder="e.g., Engineering"
                  data-example="e.g., Engineering"
                  onFocus={clearPlaceholder}
                  onBlur={restorePlaceholderIfEmpty}
                  onMouseEnter={clearPlaceholder}
                  onMouseLeave={restorePlaceholderIfEmpty}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 px-4 py-2 text-base"
                />
              </div>

              <div>
                <label htmlFor="positionTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Position Title
                </label>
                <input
                  id="positionTitle"
                  name="positionTitle"
                  type="text"
                  value={profileData.positionTitle}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Developer"
                  data-example="e.g., Senior Developer"
                  onFocus={clearPlaceholder}
                  onBlur={restorePlaceholderIfEmpty}
                  onMouseEnter={clearPlaceholder}
                  onMouseLeave={restorePlaceholderIfEmpty}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 px-4 py-2 text-base"
                />
              </div>

              <div>
                <label htmlFor="accountCreated" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Created
                </label>
                <input
                  id="accountCreated"
                  name="accountCreated"
                  type="text"
                  value={profileData.accountCreated}
                  readOnly
                  className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm px-4 py-2 text-base"
                />
              </div>

              <div>
                <label htmlFor="lastLogin" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Login
                </label>
                <input
                  id="lastLogin"
                  name="lastLogin"
                  type="text"
                  value={profileData.lastLogin}
                  readOnly
                  className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm px-4 py-2 text-base"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 text-base border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-base border border-transparent rounded-md shadow-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}