import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import * as Yup from 'yup';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Delete, Edit, View } from "../../icons";
import {
    addUser,
    editUser,
    fetchUsers,
    showUser,
} from "../../store/slices/userSlice";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/pagination/pagination";

export default function UserList() {
    const dispatch = useDispatch();
    const { users, selectedUser,loading,pagination } = useSelector((state) => state.users);

    const [searchTag, setSearchTag] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const {t}=useTranslation()
    const [currentPage, setCurrentPage] = useState(1);


    // State for user form fields
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        mobile: "",
        role: "",
        password: "",
        status: "",
        name: "",
        phone: "",
        code: "",
        comission_amount: 0,
        comission_type: "",
        registration_number: "",
        license_number: "",
        rating: 0,
        admin_comission_amount: 0,
        admin_comission_type: "",
        agent_comission_amount: 0,
        agent_comission_type: "",
        logo: '',
        description: "",
        vendor_id: 0,
    });

    useEffect(() => {
        dispatch(fetchUsers({searchTag,page:currentPage}));
    }, [dispatch, searchTag,currentPage]);

    useEffect(() => {
        if (selectedUser) {
            setFormData({
                first_name: selectedUser.first_name || "",
                last_name: selectedUser.last_name || "",
                email: selectedUser.email || "",
                mobile: selectedUser.mobile || "",
                role: selectedUser.role || "",
                password: selectedUser.password || "",
                status: selectedUser.status || "",
                name: selectedUser.name || "",
                phone: selectedUser.phone || "",
                code: selectedUser.code || "",
                comission_amount: selectedUser.comission_amount || 0,
                comission_type: selectedUser.comission_type || "",
                registration_number: selectedUser.registration_number || "",
                license_number: selectedUser.license_number || "",
                rating: selectedUser.rating || 0,
                admin_comission_amount: selectedUser.admin_comission_amount || 0,
                admin_comission_type: selectedUser.admin_comission_type || "",
                agent_comission_amount: selectedUser.agent_comission_amount || 0,
                agent_comission_type: selectedUser.agent_comission_type || "",
                logo: selectedUser.logo || '',
                description: selectedUser.description || "",
                vendor_id: selectedUser.vendor_id || 0,
            });
        }
    }, [selectedUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            // Validate form data
            await validationSchema.validate(formData, { abortEarly: false });
    
            const userData = { ...formData };
    
            if (isEditing) {
                // Dispatch the edit action
                await dispatch(editUser(currentUserId, userData)).unwrap();
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'User updated successfully.',
                });
            } else {
                // Dispatch the add action
                await dispatch(addUser(userData)).unwrap();
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'User added successfully.',
                });
            }
    
            // Reset form data and close modal
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                mobile: "",
                role: "",
                password: "",
                status: "",
                name: "",
                phone: "",
                code: "",
                comission_amount: 0,
                comission_type: "",
                registration_number: "",
                license_number: "",
                rating: 0,
                admin_comission_amount: 0,
                admin_comission_type: "",
                agent_comission_amount: 0,
                agent_comission_type: "",
                logo: '',
                description: "",
                vendor_id: 0,
            });
    
            setIsModalOpen(false);
            setIsEditing(false);
            setCurrentUserId(null);
            setFormErrors({}); // Clear any previous errors
        } catch (err) {
            const errors = {};
            if (err.inner) {
                // Yup validation errors
                err.inner.forEach((error) => {
                    errors[error.path] = error.message;
                });
                setFormErrors(errors);
    
                
            }else if(err.type==='api'){
                const newErrors = {};
                Object.entries(err.errors).forEach(([field, messages]) => {
                    newErrors[field] = Array.isArray(messages) ? messages.join(' ') : messages;
                });
                setFormErrors(newErrors);
            } 
            else {
                // API or other errors
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.message || 'Failed to add/update user. Please try again.',
                });
            }
        }
    };

    const handleEdit = (userId) => {
        dispatch(showUser(userId));
        setIsEditing(true);
        setCurrentUserId(userId);
        setIsModalOpen(true);
    };

  
    const validationSchema = Yup.object().shape({
        first_name: Yup.string().required('First Name is required'),
        last_name: Yup.string().required('Last Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        mobile: Yup.string().matches(/^[0-9]{10}$/, 'Mobile must be 10 digits'),
        role: Yup.string().required('Role is required'),
        password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
        status: Yup.string().required('Status is required'),
    
        // Conditional Fields
        name: Yup.string().when('role', (role, schema) =>
            role === 'agent' || role === 'vendor' ? schema.required('Name is required') : schema
        ),
        phone: Yup.string().when('role', (role, schema) =>
            role === 'agent' || role === 'vendor' ? schema.required('Phone is required') : schema
        ),
        code: Yup.string().when('role', (role, schema) =>
            role === 'agent' ? schema.required('Code is required') : schema
        ),
        comission_amount: Yup.number().when('role', (role, schema) =>
            role === 'agent' ? schema.required('Commission Amount is required') : schema
        ),
        comission_type: Yup.string().when('role', (role, schema) =>
            role === 'agent' ? schema.required('Commission Type is required') : schema
        ),
        registration_number: Yup.string().when('role', (role, schema) =>
            role === 'vendor' ? schema.required('Registration Number is required') : schema
        ),
        license_number: Yup.string().when('role', (role, schema) =>
            role === 'vendor' ? schema.required('License Number is required') : schema
        ),
        rating: Yup.number().when('role', (role, schema) =>
            role === 'vendor' ? schema.required('Rating is required') : schema
        ),
        admin_comission_amount: Yup.number().when('role', (role, schema) =>
            role === 'vendor' ? schema.required('Admin Commission Amount is required') : schema
        ),
        admin_comission_type: Yup.string().when('role', (role, schema) =>
            role === 'vendor' ? schema.required('Admin Commission Type is required') : schema
        ),
        agent_comission_amount: Yup.number().when('role', (role, schema) =>
            role === 'vendor' ? schema.required('Agent Commission Amount is required') : schema
        ),
        agent_comission_type: Yup.string().when('role', (role, schema) =>
            role === 'vendor' ? schema.required('Agent Commission Type is required') : schema
        ),
        logo: Yup.mixed().when('role', (role, schema) =>
            role === 'vendor' ? schema.required('Logo is required') : schema
        ),
        description: Yup.string().when('role', (role, schema) =>
            role === 'vendor' ? schema.required('Description is required') : schema
        ),
        vendor_id: Yup.number().when('role', (role, schema) =>
            role === 'driver' ? schema.required('Vendor ID is required') : schema
        ),
    });
    

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col">
                        <h2 className="text-lg font-semibold mb-4">
                            {isEditing ? t("EDIT_USER") : t("ADD_USER")}
                        </h2>

                        <div className="overflow-y-auto flex-1">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* First Name */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                    {t("FIRST_NAME")} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData?formData.first_name:""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, first_name: e.target.value })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        
                                    />
                                    {formErrors?.first_name && (
                                        <p className="text-red-500 text-sm">{formErrors?.first_name}</p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                    {t("LAST_NAME")} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData?formData.last_name:''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, last_name: e.target.value })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        
                                    />
                                    {formErrors?.last_name && (
                                        <p className="text-red-500 text-sm">{formErrors?.last_name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                    {t("EMAIL")}
                                    </label>
                                    <input
                                        type="email"
                                        value={formData?formData.email:''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {formErrors?.email && (
                                        <p className="text-red-500 text-sm">{formErrors?.email}</p>
                                    )}
                                </div>

                                {/* Mobile */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                    {t("MOBILE")}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData?formData.mobile:''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, mobile: e.target.value })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {formErrors?.mobile && (
                                        <p className="text-red-500 text-sm">{formErrors?.mobile}</p>
                                    )}
                                </div>

                                {/* Role */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                    {t("ROLE")} *
                                    </label>
                                    <select
                                        value={formData?formData.role:''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, role: e.target.value })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        
                                    >
                                        <option value="">{t("SELECT_ROLE")}</option>
                                        <option value="admin">Admin</option>
                                        <option value="customer">Customer</option>
                                        <option value="vendor">Vendor</option>
                                        <option value="agent">Agent</option>
                                        <option value="driver">Driver</option>
                                    </select>
                                    {formErrors?.role && (
                                        <p className="text-red-500 text-sm">{formErrors?.role}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                    {t("PASSWORD")} *
                                    </label>
                                    <input
                                        type="password"
                                        value={formData?formData.password:''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        
                                    />
                                    {formErrors?.password && (
                                        <p className="text-red-500 text-sm">{formErrors?.password}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                    {t("STATUS")} *
                                    </label>
                                    <select
                                        value={formData?formData.status:''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, status: e.target.value })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        
                                    >
                                        <option value="">{t("SELECT_STATUS")}</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                        <option value="banned">Banned</option>
                                    </select>
                                    {formErrors?.status && (
                                        <p className="text-red-500 text-sm">{formErrors?.status}</p>
                                    )}
                                </div>

                                {/* Conditional Fields Based on Role */}
                                {(formData.role === "agent" || formData.role === "vendor") && (
                                    <>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("NAME")}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData?formData.name:''}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, name: e.target.value })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {formErrors?.name && (
                                                <p className="text-red-500 text-sm">{formErrors?.name}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("PHONE")}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData?formData.phone:''}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, phone: e.target.value })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {formErrors?.phone && (
                                                <p className="text-red-500 text-sm">{formErrors?.phone}</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {formData.role === "agent" && (
                                    <>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("CODE")}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData?formData.code:''}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, code: e.target.value })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {formErrors?.code && (
                                                <p className="text-red-500 text-sm">{formErrors?.code}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("COMMISSION_AMOUNT")}
                                            </label>
                                            <input
                                                type="number"
                                                value={formData?formData.comission_amount:0}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        comission_amount: parseFloat(e.target.value),
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {formErrors?.comission_amount && (
                                                <p className="text-red-500 text-sm">{formErrors?.comission_amount}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("COMMISSION_TYPE")}
                                            </label>
                                            <select
                                                value={formData?formData.comission_type:""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        comission_type: e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                <option value="">{t("SELECT_COMMISSION_TYPE")}</option>
                                                <option value="fixed">Fixed</option>
                                                <option value="percentage">Percentage</option>
                                            </select>
                                            {formErrors?.comission_type && (
                                                <p className="text-red-500 text-sm">{formErrors?.comission_type}</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {formData.role === "vendor" && (
                                    <>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("REGISTRATION_NUMBER")}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData?formData.registration_number:''}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        registration_number: e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {formErrors?.registration_number && (
                                                <p className="text-red-500 text-sm">{formErrors?.registration_number}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("LICENSE_NUMBER")}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData?formData.license_number:''}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        license_number: e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {formErrors?.license_number && (
                                                <p className="text-red-500 text-sm">{formErrors?.license_number}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("RATING")}
                                            </label>
                                            <input
                                                type="number"
                                                value={formData?formData.rating:0}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        rating: parseFloat(e.target.value),
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {formErrors?.rating && (
                                                <p className="text-red-500 text-sm">{formErrors?.rating}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("ADMIN_COMMISSION_AMOUNT")}
                                            </label>
                                            <input
                                                type="number"
                                                value={formData?formData.admin_comission_amount:0}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        admin_comission_amount: parseFloat(e.target.value),
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {formErrors?.admin_comission_amount && (
                                                <p className="text-red-500 text-sm">{formErrors?.admin_comission_amount}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("ADMIN_COMMISSION_TYPE")}
                                            </label>
                                            <select
                                                value={formData?formData.admin_comission_type:""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        admin_comission_type: e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                <option value="">{t("SELECT_COMMISSION_TYPE")}</option>
                                                <option value="fixed">Fixed</option>
                                                <option value="percentage">Percentage</option>
                                            </select>
                                            {formErrors?.admin_comission_type && (
                                                <p className="text-red-500 text-sm">{formErrors?.admin_comission_type}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("AGENT_COMMISSION_AMOUNT")}
                                            </label>
                                            <input
                                                type="number"
                                                value={formData?formData.agent_comission_amount:0}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        agent_comission_amount: parseFloat(e.target.value),
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {formErrors?.agent_comission_amount && (
                                                <p className="text-red-500 text-sm">{formErrors?.agent_comission_amount}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("AGENT_COMMISSION_TYPE")}
                                            </label>
                                            <select
                                                value={formData?formData.agent_comission_type:0}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        agent_comission_type: e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                <option value="">{t("SELECT_COMMISSION_TYPE")}</option>
                                                <option value="fixed">Fixed</option>
                                                <option value="percentage">Percentage</option>
                                            </select>
                                            {formErrors?.agent_comission_type && (
                                                <p className="text-red-500 text-sm">{formErrors?.agent_comission_type}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("LOGO")}
                                            </label>
                                            <input
                                                type="file"
                                                onChange={(e) =>
                                                    setFormData({ ...formData, logo: e.target.files[0] })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {formErrors?.logo && (
                                                <p className="text-red-500 text-sm">{formErrors?.logo}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                            {t("DESCRIPTION")}
                                            </label>
                                            <textarea
                                                value={formData?formData.description:""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        description: e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {formErrors?.description && (
                                                <p className="text-red-500 text-sm">{formErrors?.description}</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {formData.role === "driver" && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">
                                        {t("VENDOR")}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData?formData.vendor_id:0}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    vendor_id: parseInt(e.target.value),
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                        {formErrors?.vendor_id && (
                                            <p className="text-red-500 text-sm">{formErrors?.vendor_id}</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormErrors(null)
                                                setIsModalOpen(false);
                                                setIsEditing(false);
                                                setCurrentUserId({});
                                            }}
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
                                </div>

                            </form>
                        </div>

                        
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {t("USER_LIST")}
                    </h3>
                </div>
                <div className="flex items-center gap-3">
                {/* Search Bar */}
                    <input
                        type="text"
                        placeholder={t("SEARCH_USER")}
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                        className="rounded-md"
                    />

                {/* Add User Button */}
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            setIsEditing(false);
                            setFormData({
                                first_name: "",
                                last_name: "",
                                email: "",
                                mobile: "",
                                role: "",
                                password: "",
                                status: "",
                                name: "",
                                phone: "",
                                code: "",
                                comission_amount: 0,
                                comission_type: "",
                                registration_number: "",
                                license_number: "",
                                rating: 0,
                                admin_comission_amount: 0,
                                admin_comission_type: "",
                                agent_comission_amount: 0,
                                agent_comission_type: "",
                                logo: '',
                                description: "",
                                vendor_id: 0,
                            });
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-300 px-4 py-2.5 text-theme-sm font-medium text-black-700 shadow-theme-xs hover:bg-gray-50 hover:text-black-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        >
                        {t("ADD_USER")}
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
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("FIRST_NAME")}</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("LAST_NAME")}</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("EMAIL")}</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("MOBILE")}</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("ROLE")}</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("STATUS")}</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{t("ACTION")}</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {users.map((user,index) => (
                            <TableRow key={index}>
                                <TableCell className="py-3 text-black-500 text-theme-sm dark:text-gray-400">{user?.first_name}</TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{user?.last_name}</TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{user?.email}</TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{user?.mobile}</TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{user?.role}</TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{user?.status}</TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <button
                                        onClick={() => handleEdit(user.id)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    {/* <button
                                        onClick={() => dispatch(deleteUser(user.id))}
                                        className="text-red-600 hover:text-red-900 ml-2"
                                    >
                                        <Delete className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => dispatch(showUser(user.id))}
                                        className="text-green-600 hover:text-green-900 ml-2"
                                    >
                                        <View className="h-5 w-5" />
                                    </button> */}
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
