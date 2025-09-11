import { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function PageFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  onFileChange,
  errors,
  isEditing,
  locales,
  statuses,
  t,
}) {
  const [imagePreview, setImagePreview] = useState(null);

  // Reset image preview when modal closes or when editing changes
  useEffect(() => {
    console.log(formData);
    if (!isOpen) {
      setImagePreview(null);
    } else if (isEditing && formData.image) {
      // If editing and there's an existing image, show it
      setImagePreview(formData.image);
    } else {
      setImagePreview(null);
    }
  }, [isOpen, isEditing, formData.image]);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    onFileChange(e);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
    // Don't reset imagePreview here as we want to keep it until modal closes
  };

  const handleClose = () => {
    setImagePreview(null); // Reset preview when closing
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? t("EDIT_PAGE") : t("ADD_PAGE")}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("NAME")} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("TITLE")} *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("SUBTITLE")}
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("LOCALE")} *
              </label>
              <select
                name="locale"
                value={formData.locale}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {locales.map((locale) => (
                  <option key={locale.value} value={locale.value}>
                    {locale.label}
                  </option>
                ))}
              </select>
              {errors.locale && (
                <p className="text-red-500 text-sm mt-1">{errors.locale}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("STATUS")} *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("IMAGE")}
              </label>
              <input
                type="file"
                name="image"
                onChange={handleFileSelect}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                accept="image/*"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      // Clear the file input
                      const fileInput = document.querySelector(
                        'input[name="image"]'
                      );
                      if (fileInput) fileInput.value = "";
                    }}
                    className="mt-1 text-xs text-red-600 hover:text-red-800"
                  >
                    {t("REMOVE_IMAGE")}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {t("CONTENT")}
            </label>
            {/* <textarea
              name="content"
              value={formData.content}
              onChange={onInputChange}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            /> */}
            <CKEditor
              editor={ClassicEditor}
              data={formData.content}
              config={{
                initialHeight: "200px", // Set your desired initial height
                toolbar: [
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "link",
                  "bulletedList",
                  "numberedList",
                  "blockQuote",
                  "insertTable",
                  "undo",
                  "redo",
                ],
              }}
              onChange={(_, editor) => {
                const data = editor.getData();
                onInputChange({
                  target: { name: "content", value: data },
                });
              }}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {t("CANCEL")}
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isEditing ? t("UPDATE") : t("ADD")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
