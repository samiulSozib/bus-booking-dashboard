import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import useOutsideClick from "../../hooks/useOutSideClick";
import Swal from "sweetalert2";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Delete, Edit, View, FunnelIcon, SearchIcon, PlusIcon } from "../../icons";
import {
  fetchPages,
  createPage,
  updatePage,
  deletePage,
  fetchPageById,
} from "../../store/slices/pagesSlice";
import Pagination from "../../components/pagination/pagination";
import { useTranslation } from "react-i18next";
import StatusBadge from "../../components/ui/badge/StatusBadge";
import PageFilter from "./PageFilter";
import PageFormModal from "./PageFormModal";
import PersianDateText from "../../utils/persianDateShowFormat";

// Validation schema
const getPageSchema = (t) =>
  Yup.object().shape({
    name: Yup.string()
      .required(t("PAGE_NAME_REQUIRED")),
    title: Yup.string()
      .required(t("PAGE_TITLE_REQUIRED")),
    locale: Yup.string()
      .required(t("PAGE_LOCALE_REQUIRED"))
      .oneOf(["ps", "en", "fa"], t("PAGE_LOCALE_INVALID")),
    status: Yup.string()
      .required(t("PAGE_STATUS_REQUIRED"))
      .oneOf(["active", "inactive"], t("PAGE_STATUS_INVALID")),
  });

export default function PageList() {
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => {
    //setShowModalPageDropdown(false);
  });

  const dispatch = useDispatch();

  const { pages, selectedPage, pagination, loading } = useSelector(
    (state) => state.pages
  );

  const [searchTag, setSearchTag] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    subtitle: "",
    content: "",
    image: null,
    locale: "en",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const { t } = useTranslation();

  const LOCALES = [
    { value: "ps", label: "Pashto" },
    { value: "en", label: "English" },
    { value: "fa", label: "Farsi" },
  ];

  const STATUSES = [
    { value: "active", label: t("ACTIVE") },
    { value: "inactive", label: t("INACTIVE") },
  ];

  useEffect(() => {
    dispatch(fetchPages({ 
      page: currentPage, 
      search: filters.searchTag || "",
      per_page: filters.per_page || 10 
    }));
  }, [dispatch, currentPage, filters]);

useEffect(() => {
  if (selectedPage && isEditing) {
    setFormData({
      name: selectedPage.name || "",
      title: selectedPage.title || "",
      subtitle: selectedPage.subtitle || "",
      content: selectedPage.content || "",
      image: selectedPage.image || null, // ✅ preserve
      locale: selectedPage.locale || "en",
      status: selectedPage.status || "active",
    });
  }
}, [selectedPage, isEditing]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await getPageSchema(t).validate(formData, { abortEarly: false });

      if (isEditing) {
        const editAction = await dispatch(
          updatePage({ 
            pageId: currentPageId, 
            pageData: formData 
          })
        );
        if (updatePage.fulfilled.match(editAction)) {
          Swal.fire({
            icon: "success",
            title: t("PAGE_SUCCESS_TITLE"),
            text: t("PAGE_SUCCESS_UPDATE"),
          });
        }
      } else {
        const addAction = await dispatch(
          createPage({ pageData: formData })
        );
        if (createPage.fulfilled.match(addAction)) {
          Swal.fire({
            icon: "success",
            title: t("PAGE_SUCCESS_TITLE"),
            text: t("PAGE_SUCCESS_CREATE"),
          });
        }
      }

      // Reset form
      setFormData({
        name: "",
        title: "",
        subtitle: "",
        content: "",
        image: null,
        locale: "en",
        status: "active",
      });
      setIsFormModalOpen(false);
      setIsEditing(false);
      setCurrentPageId(null);
      setErrors({});
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        Swal.fire({
          icon: "error",
          title: t("PAGE_ERROR_TITLE"),
          text: error.message || t("PAGE_ERROR_DEFAULT"),
        });
      }
    }
  };

  const handleDelete = (pageId) => {
    Swal.fire({
      title: t("PAGE_DELETE_CONFIRM_TITLE"),
      text: t("PAGE_DELETE_CONFIRM_TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("PAGE_DELETE_CONFIRM_YES"),
      cancelButtonText: t("PAGE_BUTTON_CANCEL"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteAction = await dispatch(deletePage(pageId));
          if (deletePage.fulfilled.match(deleteAction)) {
            Swal.fire(
              t("PAGE_DELETE_SUCCESS_TITLE"),
              t("PAGE_DELETE_SUCCESS_TEXT"),
              "success"
            );
            // Refresh the pages list
            dispatch(fetchPages({ page: currentPage }));
          }
        } catch (error) {
          Swal.fire(
            t("PAGE_ERROR_TITLE"),
            error.message || t("PAGE_DELETE_ERROR_TEXT"),
            "error"
          );
        }
      }
    });
  };

const handleEdit = async (pageId) => {
  const action = await dispatch(fetchPageById(pageId));
  if (fetchPageById.fulfilled.match(action)) {
    setFormData({
      name: action.payload.name || "",
      title: action.payload.title || "",
      subtitle: action.payload.subtitle || "",
      content: action.payload.content || "",
      image: action.payload.image || null, // ✅ keep image
      locale: action.payload.locale || "en",
      status: action.payload.status || "active",
    });
    setIsEditing(true);
    setCurrentPageId(pageId);
    setIsFormModalOpen(true);
  }
};


  const handleView = (pageId) => {
    dispatch(fetchPageById(pageId));
    setIsModalOpen(true);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setIsFilterOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* View Modal */}
      {isModalOpen && selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-lg font-semibold mb-4">{selectedPage.title}</h2>
            <div className="mb-4">
              {selectedPage.image && (
                <img 
                  src={selectedPage.image} 
                  alt={selectedPage.title}
                  className="w-full h-64 object-cover rounded-md mb-4"
                />
              )}
              <h3 className="text-md font-medium mb-2">{selectedPage.subtitle}</h3>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedPage.content }}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {t("CLOSE")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <PageFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setIsEditing(false);
          setCurrentPageId(null);
          setFormData({
            name: "",
            title: "",
            subtitle: "",
            content: "",
            image: null,
            locale: "en",
            status: "active",
          });
          setErrors({});
        }}
        onSubmit={handleSubmit}
        formData={formData}
        onInputChange={handleInputChange}
        onFileChange={handleFileChange}
        errors={errors}
        isEditing={isEditing}
        locales={LOCALES}
        statuses={STATUSES}
        t={t}
      />

      {/* Table Header and Add Button */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("PAGE_LIST")}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={t("SEARCH")}
              value={filters.searchTag || ""}
              onChange={(e) => setFilters({...filters, searchTag: e.target.value})}
            />
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <FunnelIcon className="h-5 w-5" />
              {t("FILTER")}
            </button>
          </div>

          {/* Add Page Button */}
          <button
            onClick={() => {
              setIsFormModalOpen(true);
              setIsEditing(false);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-transparent border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black shadow-theme-xs hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5" />
            {t("ADD_PAGE")}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Table className="w-full table-auto">
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("TITLE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("LOCALE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("STATUS")}
                </TableCell>
                
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ACTIONS")}
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="py-3 px-2 w-[150px] truncate">
                    <div className="flex items-center gap-3">
                      {page.image && (
                        <img 
                          src={page.image} 
                          alt={page.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {page.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {page.title}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {page.locale.toUpperCase()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <StatusBadge status={page.status} />
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      {/* <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 cursor-pointer"
                        onClick={() => handleView(page.id)}
                      >
                        <View className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                      </div> */}
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => handleEdit(page.id)}
                      >
                        <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                      </div>
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 cursor-pointer"
                        onClick={() => handleDelete(page.id)}
                      >
                        <Delete className="w-4 h-4 text-red-600 dark:text-red-300" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Filter Component */}
      <PageFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        filters={filters}
        locales={LOCALES}
        statuses={STATUSES}
        t={t}
      />
    </div>
  );
}