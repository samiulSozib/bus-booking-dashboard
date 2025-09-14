import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { ValidationError } from "yup";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Delete, Edit, SearchIcon, View } from "../../icons";

import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";
import useOutsideClick from "../../hooks/useOutSideClick";
import StatusBadge from "../../components/ui/badge/StatusBadge";
import { fetchBranches } from "../../store/slices/branchSlice";
import { createAgent, fetchAgents, showAgent, updateAgent, updateAgentUser } from "../../store/slices/agentSlice";
import { userType } from "../../utils/utils";

export default function AgentList() {
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => {
    setShowModalVendorDropdown(false);
  });

  const dispatch = useDispatch();
  const { agents, selectedAgent, loading, pagination } = useSelector(
    (state) => state.agents
  );

  const [searchTag, setSearchTag] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditingAgent, setIsEditingAgent] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("agent");
  const [modalVendorSearchTag, setModalVendorSearchTag] = useState("");
  const [showModalVendorDropdown, setShowModalVendorDropdown] = useState(false);

  const [vendorBranchSearch, setVendorBranchSearch] = useState("");
  const [showVendorBranchDropdown, setShowVendorBranchDropdown] =
    useState(false);
  const [selectedVendorBranch, setSelectedVendorBranch] = useState(null);

  const { branches } = useSelector((state) => state.branch);

  const handleModalVendorSelect = (vendor) => {
    setFormData({
      ...formData,
      vendor_id: vendor.id,
    });
    setModalVendorSearchTag(vendor.short_name);
    setShowModalVendorDropdown(false);
  };

  const handleVendorBranchSelect = (branch) => {
    setSelectedVendorBranch(branch);
    setFormData({ ...formData, vendor_branch_id: branch.id });
    setShowVendorBranchDropdown(false);
  };

  // State for user form fields
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    role: "agent",
    password: "",
    status: "",
    short_name: "",
    long_name: "",
    code: "",
    notes: "",
    bonus_amount: 0,
    commission_amount: 0,
    commission_type: "",
    registration_number: "",
    license_number: "",
    rating: 0,
    admin_comission_amount: 0,
    admin_comission_type: "",
    agent_comission_amount: 0,
    agent_comission_type: "",
    logo: "",
    description: "",
    vendor_id: 0,
    vendor_branch_id: 0,
  });

  useEffect(() => {
    dispatch(fetchAgents({ searchTag, page: currentPage }));
  }, [dispatch, searchTag, currentPage]);

  // useEffect(() => {
  //   dispatch(fetchUsers({ searchTag: modalVendorSearchTag, role: "vendor" }));
  // }, [dispatch]);

  useEffect(() => {
    if (formData?.vendor_id) {
      dispatch(
        fetchBranches({
          searchTag: vendorBranchSearch,
          vendor_id: formData?.vendor_id,
        })
      );
    } else {
      dispatch(
        fetchBranches({
          searchTag: vendorBranchSearch,
        })
      );
    }
  }, [dispatch, vendorBranchSearch, formData?.vendor_id]);

  useEffect(() => {
    if (selectedAgent) {
      const baseData = {
        first_name: selectedAgent.first_name || "",
        last_name: selectedAgent.last_name || "",
        email: selectedAgent.email || "",
        mobile: selectedAgent.mobile || "",
        role: selectedAgent.role || "agent",
        password: selectedAgent.password || "",
        status: selectedAgent.status || "",
      };

      // Role-specific fields
      const roleSpecificData = {
        // Agent-specific fields
        ...(selectedAgent.role === "agent" && {
          short_name: selectedAgent.agent?.short_name || "",
          long_name: selectedAgent.agent?.long_name || "",
          code: selectedAgent.agent?.code || "",
          notes: selectedAgent.agent?.notes,
          bonus_amount: selectedAgent.agent.bonus_amount,
          commission_amount: selectedAgent.agent?.commission_amount || 0,
          commission_type: selectedAgent.agent?.commission_type || "",
          vendor_id: selectedAgent?.agent?.vendor_id || 0,
          vendor_branch_id: selectedAgent?.agent.vendor_branch_id || 0,
        }),

        // Vendor-specific fields
        ...(selectedAgent.role === "vendor" && {
          name: selectedAgent.vendor?.name || "",
          phone: selectedAgent.vendor?.phone || "",
          registration_number: selectedAgent.vendor?.registration_number || "",
          license_number: selectedAgent.vendor?.license_number || "",
          rating: selectedAgent.vendor?.rating || 0,
          admin_comission_amount:
            selectedAgent.vendor?.admin_comission_amount || 0,
          admin_comission_type:
            selectedAgent.vendor?.admin_comission_type || "",
          agent_comission_amount:
            selectedAgent.vendor?.agent_comission_amount || 0,
          agent_comission_type:
            selectedAgent.vendor?.agent_comission_type || "",
          logo: selectedAgent.vendor?.logo || "",
          description: selectedAgent.vendor?.description || "",
        }),
      };

      if (selectedAgent.role === "agent") {
        setVendorBranchSearch(selectedAgent?.agent?.branch?.name);
        setModalVendorSearchTag(selectedAgent?.agent?.vendor?.short_name);
      }

      setFormData({
        ...baseData,
        ...roleSpecificData,
      });
    }
  }, [selectedAgent]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Clear previous errors
      setFormErrors({});
      //console.log(formData);
      //return;
      // Validate form data
      await getValidationSchema(t, isEditingAgent, isEditing).validate(
        formData,
        {
          abortEarly: false,
        }
      );

      const userData = { ...formData };
      let result;

      if (isEditing) {
        result = await dispatch(
          updateAgentUser({ id: currentUserId, updatedData: userData })
        );
      } else if (isEditingAgent) {
        result = await dispatch(
          updateAgent({ id: currentAgentId, updatedData: userData })
        );
      } else {
        result = await dispatch(createAgent(userData));
      }

      // Check if the action was successful
      if (result.error) {
        // Handle API validation errors
        if (result.payload?.errors) {
          const apiErrors = {};
          Object.entries(result.payload.errors).forEach(([field, messages]) => {
            apiErrors[field] = Array.isArray(messages)
              ? messages.join(" ")
              : messages;
          });
          setFormErrors(apiErrors);
          return;
        }
        throw new Error(result.payload?.message || t("failedToProcessRequest"));
      }

      // Success case
      Swal.fire({
        icon: "success",
        title: t("success"),
        text:
          isEditing || isEditingAgent
            ? t("userUpdateSuccessfully")
            : t("userAddedSuccessfully"),
      });

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        mobile: "",
        role: "agent",
        password: "",
        status: "",
        short_name: "",
        long_name: "",
        code: "",
        notes: "",
        bonus_amount: 0,
        commission_amount: 0,
        commission_type: "",
        registration_number: "",
        license_number: "",
        rating: 0,
        admin_comission_amount: 0,
        admin_comission_type: "",
        agent_comission_amount: 0,
        agent_comission_type: "",
        logo: "",
        description: "",
        vendor_id: 0,
        vendor_branch_id: 0,
      });
      setIsModalOpen(false);
      setIsEditing(false);
      setIsEditingAgent(false);
      setCurrentUserId(null);
      setCurrentAgentId(null);
      setModalVendorSearchTag("");
      setVendorBranchSearch("");
    } catch (err) {
      console.error("Submission error:", err);

      if (err.name === "ValidationError") {
        // Yup validation errors
        const validationErrors = {};
        err.inner.forEach((error) => {
          if (!validationErrors[error.path]) {
            validationErrors[error.path] = error.message;
          }
        });
        setFormErrors(validationErrors);
      } else {
        // Other errors
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: err.message || t("failedToProcessRequest"),
        });
      }
    }
  };

  const handleEdit = (user) => {
    console.log(user)
    dispatch(showAgent(user.id));
    setIsEditing(true);
    setCurrentUserId(user.id);
    setCurrentAgentId(user.agent?.id);
    setIsModalOpen(true);
  };

  const handleEditAgent = (user) => {
    dispatch(showAgent(user.id));
    setIsEditingAgent(true);
    setCurrentUserId(user.id);
    setCurrentAgentId(user.agent?.id);
    setIsModalOpen(true);
  };

  const getValidationSchema = (t, isEditingAgent, isEditing) => {
    const isAgentContext = !isEditing || isEditingAgent;
    const isNewUser = !isEditing && !isEditingAgent;

    return Yup.object().shape({
      // Basic user info (always required)
      first_name: Yup.string().required(t("user.firstNameRequired")),
      last_name: Yup.string().required(t("user.lastNameRequired")),
      email: Yup.string()
        .email(t("user.invalidEmail"))
        .required(t("user.emailRequired")),
      mobile: Yup.string()
        .matches(/^[0-9]{10}$/, t("user.mobileInvalid"))
        .required(t("user.mobileRequired")),
      status: Yup.string().required(t("user.statusRequired")),

      // Password - only required for new users
      password: isNewUser
        ? Yup.string()
            .required(t("user.passwordRequired"))
            .min(6, t("user.passwordMin"))
        : Yup.string(),

      // Agent-specific fields
      ...(isAgentContext && {
        short_name: Yup.string().required(t("user.shortNameRequired")),
        long_name: Yup.string().required(t("user.longNameRequired")),
        code: Yup.string().required(t("user.codeRequired")),
        notes: Yup.string().required(t("user.notesRequired")),
        bonus_amount: Yup.number().required(t("user.bonusAmountRequired")),
        commission_amount: Yup.number().required(
          t("user.commissionAmountRequired")
        ),
        commission_type: Yup.string().required(
          t("user.commissionTypeRequired")
        ),
        vendor_id: Yup.number().required(t("user.vendorIdRequired")),
        vendor_branch_id: Yup.number().required(
          t("user.vendorBranchIdRequired")
        ),
      }),
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing
                ? t("edit_user")
                : isEditingAgent
                ? t("edit_agent")
                : t("add_agent")}
            </h2>

            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit}>
                {/* User Information Section */}
                {!isEditingAgent && (
                  <div className="mb-4 p-2 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {t("USER_INFORMATION")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* First Name */}
                      <div className="mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("FIRST_NAME")} *
                        </label>
                        <input
                          type="text"
                          value={formData?.first_name || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              first_name: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border"
                        />
                        {formErrors?.first_name && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors?.first_name}
                          </p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div className="mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("LAST_NAME")} *
                        </label>
                        <input
                          type="text"
                          value={formData?.last_name || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              last_name: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border"
                        />
                        {formErrors?.last_name && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors?.last_name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("EMAIL")}
                        </label>
                        <input
                          type="email"
                          value={formData?.email || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border"
                        />
                        {formErrors?.email && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors?.email}
                          </p>
                        )}
                      </div>

                      {/* Mobile */}
                      <div className="mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("MOBILE")}
                        </label>
                        <input
                          type="text"
                          value={formData?.mobile || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, mobile: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border"
                        />
                        {formErrors?.mobile && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors?.mobile}
                          </p>
                        )}
                      </div>

                      {/* Role */}
                      <div className="mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("ROLE")} *
                        </label>
                        <select
                          disabled
                          value={formData?.role || "agent"}
                          onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border bg-gray-100"
                        >
                          <option value="">{t("SELECT_ROLE")}</option>
                          <option value="admin">Admin</option>
                          <option value="customer">Customer</option>
                          <option value="vendor">Vendor</option>
                          <option value="agent">Agent</option>
                          <option value="driver">Driver</option>
                        </select>
                        {formErrors?.role && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors?.role}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      {!isEditingAgent && (
                        <div className="mb-1.5">
                          <label className="block text-sm font-medium text-gray-700">
                            {t("PASSWORD")} *
                          </label>
                          <input
                            type="password"
                            value={formData?.password || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border"
                          />
                          {formErrors?.password && (
                            <p className="text-red-500 text-xs mt-1">
                              {formErrors?.password}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Status */}
                      <div className="mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("STATUS")} *
                        </label>
                        <select
                          value={formData?.status || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border"
                        >
                          <option value="">{t("SELECT_STATUS")}</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                          <option value="banned">Banned</option>
                        </select>
                        {formErrors?.status && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors?.status}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Agent Information Section */}
                {!isEditing && (
                  <div className="mb-4 p-2 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {t("AGENT_INFORMATION")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* vendor */}
                      {/* <div className="mb-4" ref={dropdownRef}>
                        <label className="block text-sm font-medium text-gray-700">
                          {t("VENDOR")} *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={t("SEARCH_VENDOR")}
                            value={modalVendorSearchTag}
                            onChange={(e) => {
                              setModalVendorSearchTag(e.target.value);
                              setShowModalVendorDropdown(true);
                            }}
                            onFocus={() => setShowModalVendorDropdown(true)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                          {showModalVendorDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {vendorList
                                .filter((vendor) => {
                                  const name =
                                    vendor?.vendor?.short_name?.toLowerCase() ??
                                    "";
                                  const search =
                                    modalVendorSearchTag?.toLowerCase() ?? "";
                                  return name && name.includes(search);
                                })
                                .map((vendor) => (
                                  <div
                                    key={vendor?.vendor?.id}
                                    onClick={() =>
                                      handleModalVendorSelect(vendor?.vendor)
                                    }
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                  >
                                    {vendor?.vendor?.short_name}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div> */}

                      {/* branch */}
                      {userType().role != "branch" && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("BRANCH")}
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder={t("SEARCH_BRANCH")}
                              value={vendorBranchSearch} // Always use driverSearch for the value
                              onChange={(e) => {
                                setVendorBranchSearch(e.target.value);
                                setShowVendorBranchDropdown(true);
                                if (
                                  selectedVendorBranch &&
                                  e.target.value !==
                                    `${selectedVendorBranch?.name}`
                                ) {
                                  setSelectedVendorBranch(null);
                                  setFormData({
                                    ...formData,
                                    vendor_branch_id: "",
                                  });
                                }
                              }}
                              onFocus={() => setShowVendorBranchDropdown(true)}
                              onBlur={() =>
                                setTimeout(
                                  () => setShowVendorBranchDropdown(false),
                                  200
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            {showVendorBranchDropdown && (
                              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {branches
                                  .filter((branch) =>
                                    `${branch?.branch?.name} || ""}`
                                      .toLowerCase()
                                      .includes(
                                        vendorBranchSearch.toLowerCase()
                                      )
                                  )
                                  .map((branch) => (
                                    <div
                                      key={branch?.branch?.id}
                                      onClick={() => {
                                        handleVendorBranchSelect(
                                          branch?.branch
                                        );
                                        setVendorBranchSearch(
                                          `${branch?.branch?.name}`
                                        );
                                      }}
                                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                                    >
                                      {branch?.branch?.name}
                                    </div>
                                  ))}
                                {branches.filter((branch) =>
                                  `${branch?.branch?.name} || ""}`
                                    .toLowerCase()
                                    .includes(vendorBranchSearch.toLowerCase())
                                ).length === 0 && (
                                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                                    {t("NO_BRANCH_FOUND")}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {/* {errors.vendor_branch_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.vendor_branch_id}
                </p>
              )} */}
                        </div>
                      )}

                      {/* branch */}

                      {/* Name */}

                      <div className="mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("SHORT_NAME")}
                        </label>
                        <input
                          type="text"
                          value={formData?.short_name || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              short_name: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border"
                        />
                        {formErrors?.short_name && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors?.short_name}
                          </p>
                        )}
                      </div>

                      {/* LONG NAME */}
                      <div className="mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("LONG_NAME")}
                        </label>
                        <input
                          type="text"
                          value={formData?.long_name || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              long_name: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border"
                        />
                        {formErrors?.long_name && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors?.long_name}
                          </p>
                        )}
                      </div>

                      {/* Code */}
                      <div className="mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("CODE")}
                        </label>
                        <input
                          type="text"
                          value={formData?.code || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              code: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border"
                        />
                        {formErrors?.code && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors?.code}
                          </p>
                        )}
                      </div>

                      {/* notes */}
                      <div className="mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("NOTES")}
                        </label>
                        <input
                          type="text"
                          value={formData?.notes || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              notes: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border"
                        />
                        {formErrors?.notes && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors?.notes}
                          </p>
                        )}
                      </div>

                      {/* bonus Amount */}
                      <div className="mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("BONUS_AMOUNT")}
                        </label>
                        <input
                          type="number"
                          value={formData?.bonus_amount || 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bonus_amount: parseFloat(e.target.value),
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border"
                        />
                        {formErrors?.bonus_amount && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors?.bonus_amount}
                          </p>
                        )}
                      </div>

                      {/* Commission Amount */}
                      <div className="mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("COMMISSION_AMOUNT")}
                        </label>
                        <input
                          type="number"
                          value={formData?.commission_amount || 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              commission_amount: parseFloat(e.target.value),
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border"
                        />
                        {formErrors?.commission_amount && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors?.commission_amount}
                          </p>
                        )}
                      </div>

                      {/* Commission Type */}
                      <div className="mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("COMMISSION_TYPE")}
                        </label>
                        <select
                          value={formData?.commission_type || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              commission_type: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm  border"
                        >
                          <option value="">
                            {t("SELECT_COMMISSION_TYPE")}
                          </option>
                          <option value="fixed">Fixed</option>
                          <option value="percentage">Percentage</option>
                        </select>
                        {formErrors?.commission_type && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors?.commission_type}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormErrors(null);
                      setIsModalOpen(false);
                      setIsEditing(false);
                      setCurrentUserId({});
                      setCurrentAgentId(null);
                      setIsEditingAgent(false);
                      setModalVendorSearchTag("");
                      setVendorBranchSearch("");
                      setFormData({
                        first_name: "",
                        last_name: "",
                        email: "",
                        mobile: "",
                        role: "agent",
                        password: "",
                        status: "",
                        short_name: "",
                        long_name: "",
                        code: "",
                        notes: "",
                        bonus_amount: 0,
                        commission_amount: 0,
                        commission_type: "",
                        registration_number: "",
                        license_number: "",
                        rating: 0,
                        admin_comission_amount: 0,
                        admin_comission_type: "",
                        agent_comission_amount: 0,
                        agent_comission_type: "",
                        logo: "",
                        description: "",
                        vendor_id: 0,
                        vendor_branch_id: 0,
                      });
                    }}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                  >
                    {t("CANCEL")}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                  >
                    {isEditing || isEditingAgent ? t("UPDATE") : t("ADD")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("agent_list")}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={t("SEARCH")}
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
            />
          </div>

          {/* Add User Button */}
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditing(false);
              setIsEditingAgent(false);
              setModalVendorSearchTag("");
              setVendorBranchSearch("");
              setFormData({
                first_name: "",
                last_name: "",
                email: "",
                mobile: "",
                role: "agent",
                password: "",
                status: "",
                short_name: "",
                long_name: "",
                code: "",
                notes: "",
                bonus_amount: 0,
                commission_amount: 0,
                commission_type: "",
                registration_number: "",
                license_number: "",
                rating: 0,
                admin_comission_amount: 0,
                admin_comission_type: "",
                agent_comission_amount: 0,
                agent_comission_type: "",
                logo: "",
                description: "",
                vendor_id: 0,
                vendor_branch_id: 0,
              });
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("add_agent")}
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                {/* <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("FIRST_NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("LAST_NAME")}
                </TableCell> */}
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("AGENT_NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("EMAIL")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("MOBILE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("COMMISSION_AMOUNT")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("COMMISSION_TYPE")}
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ROLE")}
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
                  {t("ACTION")}
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {agents.map((user, index) => (
                <TableRow key={index} className="hover:bg-yellow-50">
                  {/* <TableCell className="py-3 px-2 w-[150px] truncate text-black-500 text-theme-sm dark:text-gray-400">
                      {user?.first_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user?.last_name}
                    </TableCell> */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user?.agent?.short_name} {user?.agent?.last_name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user?.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user?.mobile}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user?.agent?.commission_amount}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user?.agent?.commission_type}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user?.role}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <StatusBadge status={user?.status} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => handleEdit(user)}
                        title={t("edit_user")}
                      >
                        <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                      </div>
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => handleEditAgent(user)}
                        title={t("edit_agent")}
                      >
                        <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
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
    </div>
  );
}
