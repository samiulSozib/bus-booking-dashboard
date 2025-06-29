import { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";

// Validation schema

export const PermissionDialog = ({ 
  isOpen, 
  onClose, 
  userPermissions = [], 
  userId,
  onSave 
}) => {
  const { t } = useTranslation();
  const [modifiedPermissions, setModifiedPermissions] = useState([]);

  useEffect(() => {
    if (userPermissions) {
      // Initialize with the original permissions array
      setModifiedPermissions([...userPermissions]);
    }
  }, [userPermissions]);

  const handlePermissionChange = (permissionTitle) => {
    setModifiedPermissions(prev => 
      prev.map(permission => 
        permission.title === permissionTitle
          ? { ...permission, has_permission: !permission.has_permission }
          : permission
      )
    );
  };

  const handleSave = () => {
    // Get only the permissions that have been changed
    const updatedPermissions = modifiedPermissions
      .filter(permission => 
        permission.has_permission !== 
        (userPermissions.find(p => p.title === permission.title)?.has_permission || false)
      )
      .map(({ title, has_permission }) => ({ title, has_permission }));

    //console.log(updatedPermissions)
    //return
    onSave(userId, updatedPermissions);
    onClose();
  };
    //console.log(modifiedPermissions)

  if (!isOpen) return null;

 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {t("MANAGE_PERMISSIONS")}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {modifiedPermissions?.map(permission => (
            <div key={permission.title} className="flex items-center">
              <input
                type="checkbox"
                id={`perm-${permission.title}`}
                checked={permission.has_permission}
                onChange={() => handlePermissionChange(permission.title)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={`perm-${permission.title}`} className="ml-2 text-sm text-gray-700">
                {t(permission.name)}
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {t("CANCEL")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {t("SAVE")}
          </button>
        </div>
      </div>
    </div>
  );
};