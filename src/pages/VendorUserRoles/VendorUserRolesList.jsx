import { useState, useEffect } from "react";
import * as Yup from "yup";
import Swal from "sweetalert2";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";

import { SearchIcon } from "../../icons";
import { Delete, Edit } from "../../icons";
import {
  addRole,
  deleteRole,
  fetchRoles,
  showRole,
  updateRole,
} from "../../store/slices/vendorRolesSlice";
import { fetchPermissions } from "../../store/slices/vendorUserSlice";
import { RoleFormModal } from "./RoleFormModal";
import { useHasPermission, userType } from "../../utils/utils";

// Validation schema for roles
const roleSchema = Yup.object().shape({
  title: Yup.string().required("Role title is required"),
  name: Yup.string().required("Role name is required"),
  description: Yup.string().nullable(),
});

export default function VendorUserRolesList() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { permissions } = useSelector((state) => state.vendorUser);
  const { roles, loading, pagination, selectedRole } = useSelector(
    (state) => state.vendorRoles
  );

  const [searchTag, setSearchTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState(null);
    const [vendorBranchSearch, setVendorBranchSearch] = useState("");


  const [formData, setFormData] = useState({
    vendor_branch_id:"",
    title: "",
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState([]);
    const isBranch = userType().role === "branch";
  

  // Fetch roles and permissions on component mount
  useEffect(() => {
    dispatch(fetchRoles({ searchTag, page: currentPage }));
  }, [dispatch, currentPage, searchTag]);

  useEffect(() => {
    if(formData.vendor_branch_id){
      dispatch(fetchPermissions({branch_permissions:formData.vendor_branch_id}));
    }else if(isBranch){
      dispatch(fetchPermissions({}));
    }
  }, [dispatch, formData?.vendor_branch_id]);

  

  // Load role data when editing
  useEffect(() => {
    if (currentRoleId && isEditing) {
      dispatch(showRole(currentRoleId));
    }
  }, [currentRoleId, isEditing, dispatch]);

  useEffect(() => {
    if (selectedRole && isEditing) {
      setFormData({
        title: selectedRole.title,
        name: selectedRole.name,
        description: selectedRole.description || "",
      });
      setSelectedPermissions(
        selectedRole.permissions
      );
    }
  }, [selectedRole, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionChange = (permissionTitle) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionTitle)
        ? prev.filter((p) => p !== permissionTitle)
        : [...prev, permissionTitle]
    );
  };

  const validateForm = async () => {
    try {
      await roleSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach((error) => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(await validateForm())) return;

    try {
      const roleData = {
        ...formData,
        permissions: selectedPermissions,
      };

      
      //console.log(roleData);
      //return

      const action = isEditing
        ? updateRole({ id: currentRoleId, roleData })
        : addRole(roleData);

      const result = await dispatch(action);

      if (result.error) {
        throw new Error(result.payload || t('FAILED_TO_SAVE_ROLE'));
      }

      Swal.fire({
        icon: "success",
        title: t("SUCCESS"),
        text: isEditing ? t("ROLE_UPDATED_SUCCESS") : t("ROLE_ADDED_SUCCESS"),
      });
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("ERROR"),
        text: error.message,
      });
    }
  };

  const handleDelete = async (roleId) => {
    const result = await Swal.fire({
      title: t("DELETE_CONFIRMATION"),
      text: t("DELETE_ITEM_CONFIRMATION_TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("YES_DELETE"),
      cancelButtonText: t("CANCEL"),
    });

    if (result.isConfirmed) {
      const deleteResult = await dispatch(deleteRole(roleId));
      if (deleteResult.error) {
        Swal.fire(t("ERROR"), t("FAILED_TO_DELETE_ITEM"), "error");
      } else {
        Swal.fire(t("DELETED"), t("ITEM_DELETED_SUCCESSFULLY"), "success");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      vendor_branch_id:"",
      title: "",
      name: "",
      description: "",
    });
    setVendorBranchSearch("")
    setSelectedPermissions([]);
    setErrors({});
    setIsEditing(false);
    setCurrentRoleId(null);
  };

  const handleEdit = (roleId) => {
    setCurrentRoleId(roleId);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Role Form Modal */}
      {isModalOpen && (
        <RoleFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          permissions={permissions}
          selectedPermissions={selectedPermissions}
          isEditing={isEditing}
          onInputChange={handleInputChange}
          onPermissionChange={handlePermissionChange}
          onSubmit={handleSubmit}
          vendorBranchSearch={vendorBranchSearch}
          setVendorBranchSearch={setVendorBranchSearch}
        />
      )}

      {/* Table Header and Add Button */}
      <div className="page-header-info-bar flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("VENDOR_USER_ROLES_LIST")}
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
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
            />
          </div>
        {useHasPermission("v1.vendor.role.create")&&(
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("ADD_ROLES")}
          </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ROLE_TITLE")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ROLE_NAME")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ROLE_DESCRIPTION")}
                </TableCell>
                {/* <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  {t("PERMISSIONS")}
                </TableCell> */}
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("ACTION")}
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {roles?.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="py-3">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {role.title}
                    </p>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {role.name}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {role.description || "-"}
                  </TableCell>
                  {/* <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions?.slice(0, 3).map(p => (
                        <span key={p.id} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {p.name}
                        </span>
                      ))}
                      {role.permissions?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </TableCell> */}
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex flex-row items-center justify-start gap-2">
                      {useHasPermission("v1.vendor.role.update")&&(
                      <button
                        onClick={() => handleEdit(role.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                      >
                        <Edit className="w-4 h-4 text-gray-700 dark:text-white" />
                      </button>
                      )}
                      {useHasPermission("v1.vendor.role.delete")&&(
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                      >
                        <Delete className="w-4 h-4 text-gray-700 dark:text-white" />
                      </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
