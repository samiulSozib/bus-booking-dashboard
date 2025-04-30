import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { addBus, editBus, fetchBusById, updateSeat } from '../../store/slices/busSlice';
import { useTranslation } from 'react-i18next';
import {
    fetchUsers,
} from "../../store/slices/userSlice";
import { userType } from "../../utils/utils";
import { fetchDrivers } from '../../store/slices/driverSlice';
import Swal from 'sweetalert2';


// Yup validation schema for bus information


const AddBus = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { busId } = useParams(); // Get busId from URL if editing
    const {t}=useTranslation()


    const [formData, setFormData] = useState({
        driver_id: '',
        vendor_id:'',
        name: '',
        bus_number: '',
        image: null,
        facilities: '',
        ticket_price: '',
        status: 'active',
        berth_type: '', // 'lower' or 'upper'
        rows: '', // Number of rows
        columns: '', // Number of columns
        seats: [], // Array of seat objects
    });

    const [openDialog, setOpenDialog] = useState(false); // To open/close the berth configuration dialog
    const [selectedSeat, setSelectedSeat] = useState(null); // Selected seat for editing
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const isVendor=userType().role==="vendor"


    const [driverSearch, setDriverSearch] = useState("");
    const [showDriverDropdown, setShowDriverDropdown] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

    const [vendorSearch, setVendorSearch] = useState("");
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    const { bus } = useSelector((state) => state.buses); // Fetch bus data if editing
    const { driverList,vendorList } = useSelector((state) => state.users); // Assuming you have a drivers slice
    const { drivers } = useSelector((state) => state.drivers);




    useEffect(() => {
        
        if (!isVendor) {
            dispatch(fetchUsers({ searchTag: driverSearch, role: 'driver' }));
            dispatch(fetchUsers({ searchTag: vendorSearch, role: 'vendor' }));
        }else{
            dispatch(fetchDrivers({ searchTag: driverSearch }));
        }
    }, [dispatch, isVendor,driverSearch,vendorSearch]);

    // Fetch bus data if busId is provided (editing mode)
    useEffect(() => {
        if (busId) {
            dispatch(fetchBusById(busId));
        }
    }, [busId, dispatch]);

    useEffect(()=>{
        //console.log(bus)
    },[dispatch,busId])

    // Populate form data if bus data is fetched
    useEffect(() => {
        if (busId && bus) {
            //setDriverSearch(bus.driver_id)
            //setVendorSearch(bus.vendor_id)
            setFormData({
                driver_id: bus.driver_id,
                vendor_id:bus.vendor_id,
                name: bus.name,
                bus_number: bus.bus_number,
                image: bus.image,
                facilities: Array.isArray(bus.facilities) 
                ? bus.facilities.join(', ') 
                : bus.facilities || '',
                ticket_price: bus.ticket_price,
                status: bus.status,
                berth_type: bus?.seats?.berth_type,
                rows: bus?.seats?.rows,
                columns: bus?.seats?.columns,
                seats: bus?.seats?.seats,
            });
            setDriverSearch(bus.driver.first_name)
            setVendorSearch(bus.vendor.name)
            if (bus.image) {
                setImagePreview(bus.image);
            }
        }
    }, [bus, busId]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            setFormData({ ...formData, [name]: file });
            setImagePreview(URL.createObjectURL(file)); // Generate and set the image preview URL
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleDriverSelect = (driver) => {
        setSelectedDriver(driver);
        setFormData({...formData, driver_id: driver.id});
        setShowDriverDropdown(false);
    };

    const handleVendorSelect = (vendor) => {
        setSelectedVendor(vendor);
        setFormData({...formData, vendor_id: vendor.id});
        setShowVendorDropdown(false);
    };

    const handleBerthChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSeatClick = (row, column) => {
        const seat = formData.seats.find((s) => s.row === row && s.column === column);
        
        // Row থেকে A, B, C... পাওয়ার জন্য
        const rowChar = String.fromCharCode(64 + row); 
        const seatNumberInt = parseInt(`${row}${column}`, 10); // সংখ্যা আকারে seat_number
        
        setSelectedSeat({ 
            row, 
            column, 
            seat_number: seatNumberInt, 
            ...seat 
        });
    };
    

    
    


    const handleSeatSave = (seatData) => {
        const { row, column, ...rest } = seatData;
        const updatedSeats = formData.seats.filter(
            (s) => !(s.row === row && s.column === column)
        );
        updatedSeats.push({ row, column, ...rest });

        setFormData({ ...formData, seats: updatedSeats });
        setSelectedSeat(null);
    };

    // const generateSeatLayout = (rows, columns) => {
    //     if (!rows || !columns) return null;

    //     // Determine the number of seats on the left and right sides
    //     let leftSeats, rightSeats;
    //     if (columns === 2) {
    //         leftSeats = 1;
    //         rightSeats = 1;
    //     } else if (columns === 3) {
    //         leftSeats = 1;
    //         rightSeats = 2;
    //     } else if (columns === 4) {
    //         leftSeats = 2;
    //         rightSeats = 2;
    //     } else if (columns === 5) {
    //         leftSeats = 2;
    //         rightSeats = 3;
    //     } else {
    //         // Default to equal split for other column counts
    //         leftSeats = Math.floor(columns / 2);
    //         rightSeats = columns - leftSeats;
    //     }

    //     // Function to get row hint text (A, B, C, D, etc.)
    //     const getRowHint = (rowIndex) => {
    //         return String.fromCharCode(65 + rowIndex); // 65 is ASCII for 'A'
    //     };

    //     return (
    //         <div className="grid gap-2 mt-4">
    //             {Array.from({ length: rows }, (_, rowIndex) => (
    //                 <div key={rowIndex} className="flex gap-2 justify-between mb-3 bg-gray-100 rounded-md p-1">
    //                     {/* Left Side Seats */}
    //                     <div className="flex gap-2">
    //                         {Array.from({ length: leftSeats }, (_, colIndex) => {
    //                             const seatNumber = `${getRowHint(rowIndex)}${colIndex + 1}`; // e.g., A1, A2, etc.
    //                             const seat = formData.seats.find(
    //                                 (s) => s.row === rowIndex + 1 && s.column === colIndex + 1
    //                             );
    //                             return (
    //                                 <div
    //                                     key={colIndex}
    //                                     className={`w-14 h-14 rounded-md p-2 flex flex-col gap-1 items-center justify-center dark:border-gray-600 cursor-pointer ${
    //                                         seat ? 'bg-green-200' : 'dark:bg-gray-700'
    //                                     }`}
    //                                     onClick={() => handleSeatClick(rowIndex + 1, colIndex + 1)}
    //                                 >
    //                                     <img src="/images/img/seat.png" alt="" className="w-8 h-8" />
    //                                     <span className="text-xs">{seatNumber}</span>
    //                                 </div>
    //                             );
    //                         })}
    //                     </div>

    //                     {/* Right Side Seats */}
    //                     <div className="flex gap-2">
    //                         {Array.from({ length: rightSeats }, (_, colIndex) => {
    //                             const seatNumber = `${getRowHint(rowIndex)}${colIndex + leftSeats + 1}`; // e.g., A3, A4, etc.
    //                             const seat = formData.seats.find(
    //                                 (s) => s.row === rowIndex + 1 && s.column === colIndex + leftSeats + 1
    //                             );
    //                             return (
    //                                 <div
    //                                     key={colIndex + leftSeats}
    //                                     className={`w-14 h-14 rounded-md p-2 flex flex-col items-center justify-center dark:border-gray-600 cursor-pointer ${
    //                                         seat ? 'bg-green-200' : 'dark:bg-gray-700'
    //                                     }`}
    //                                     onClick={() => handleSeatClick(rowIndex + 1, colIndex + leftSeats + 1)}
    //                                 >
    //                                     <img src="/public/images/img/seat.png" alt="" className="w-8 h-8" />
    //                                     <span className="text-xs">{seatNumber}</span>
    //                                 </div>
    //                             );
    //                         })}
    //                     </div>
    //                 </div>
    //             ))}
    //         </div>
    //     );
    // };

    const isSeatComplete = (seat) => {
        return (
            seat.price > 0 &&
            seat.seat_type &&
            seat.seat_type.trim() !== '' &&
            seat.seat_class &&
            seat.seat_class.trim() !== '' &&
            seat.is_recliner !== undefined &&
            seat.is_sleeper !== undefined
        );
    };
    const generateSeatLayout = (rows, columns) => {
        if (!rows || !columns) return null;
    
        // If seats array is empty, initialize it with default seat objects
        if (formData.seats.length === 0) {
            const newSeats = [];
            for (let row = 1; row <= rows; row++) {
                for (let col = 1; col <= columns; col++) {
                    const seatType=(col===1|| col===columns)?'window':"middle"
                    newSeats.push({
                        row,
                        column: col,
                        seat_number: parseInt(`${row}${col}`, 10),
                        price: formData.ticket_price || 0,
                        seat_type: seatType,
                        seat_class: 'economic',
                        is_recliner: 0,
                        is_sleeper: 0,
                    });
                }
            }
            setFormData(prev => ({ ...prev, seats: newSeats }));
        }
    
        // Determine the number of seats on the left and right sides
        let leftSeats, rightSeats;
        if (columns === 2) {
            leftSeats = 1;
            rightSeats = 1;
        } else if (columns === 3) {
            leftSeats = 1;
            rightSeats = 2;
        } else if (columns === 4) {
            leftSeats = 2;
            rightSeats = 2;
        } else if (columns === 5) {
            leftSeats = 2;
            rightSeats = 3;
        } else {
            // Default to equal split for other column counts
            leftSeats = Math.floor(columns / 2);
            rightSeats = columns - leftSeats;
        }
    
        // Function to get row hint text (A, B, C, D, etc.)
        const getRowHint = (rowIndex) => {
            return String.fromCharCode(65 + rowIndex); // 65 is ASCII for 'A'
        };
    
        return (
            <div className="grid gap-2 mt-4">
                {Array.from({ length: rows }, (_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2 justify-between mb-3 bg-gray-100 rounded-md p-1">
                        {/* Left Side Seats */}
                        <div className="flex gap-2">
                            {Array.from({ length: leftSeats }, (_, colIndex) => {
                                const seatNumber = `${getRowHint(rowIndex)}${colIndex + 1}`; // e.g., A1, A2, etc.
                                const seat = formData.seats.find(
                                    (s) => s.row === rowIndex + 1 && s.column === colIndex + 1
                                );
                                const isComplete = seat ? isSeatComplete(seat) : false;

                                return (
                                    <div
                                        key={colIndex}
                                        className={`w-14 h-14 rounded-md p-2 flex flex-col gap-1 items-center justify-center dark:border-gray-600 cursor-pointer ${
                                            isComplete ? 'bg-green-200' : 'dark:bg-gray-700'
                                        }`}
                                        onClick={() => handleSeatClick(rowIndex + 1, colIndex + 1)}
                                    >
                                        <img src="/images/img/seat.png" alt="" className="w-8 h-8" />
                                        <span className="text-xs">{seatNumber}</span>
                                    </div>
                                );
                            })}
                        </div>
    
                        {/* Right Side Seats */}
                        <div className="flex gap-2">
                            {Array.from({ length: rightSeats }, (_, colIndex) => {
                                const seatNumber = `${getRowHint(rowIndex)}${colIndex + leftSeats + 1}`; // e.g., A3, A4, etc.
                                const seat = formData.seats.find(
                                    (s) => s.row === rowIndex + 1 && s.column === colIndex + leftSeats + 1
                                );
                                const isComplete = seat ? isSeatComplete(seat) : false;

                                return (
                                    <div
                                        key={colIndex + leftSeats}
                                        className={`w-14 h-14 rounded-md p-2 flex flex-col items-center justify-center dark:border-gray-600 cursor-pointer ${
                                            isComplete ? 'bg-green-200' : 'dark:bg-gray-700'
                                        }`}
                                        onClick={() => handleSeatClick(rowIndex + 1, colIndex + leftSeats + 1)}
                                    >
                                        <img src="/images/img/seat.png" alt="" className="w-8 h-8" />
                                        <span className="text-xs">{seatNumber}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await getBusInfoSchema(isVendor, t).validate(formData, { abortEarly: false });

            if (busId) {
                await dispatch(editBus({ busId, busData: formData }));
            } else {
                await dispatch(addBus({ busData: formData }));
            }

            // Show success alert
            Swal.fire({
                icon: 'success',
                title: t('bus.successTitle'), // e.g., "Success!"
                text: busId ? t('bus.updatedSuccessfully') : t('bus.addedSuccessfully'), // e.g., "Bus updated successfully."
                confirmButtonText: t('common.ok') || 'OK'
            }).then(() => {
                navigate('/buses'); // Redirect after closing alert
            });

        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const newErrors = {};
                error.inner.forEach((err) => {
                    newErrors[err.path] = err.message;
                });
                setErrors(newErrors);
            } else {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: t('common.errorOccurred') || 'Error!',
                    text: error.message || t('common.somethingWentWrong'),
                });
            }
        }
    };

    const handleSaveChangeSeat=async (e)=>{
        //console.log(formData.seats)
        await dispatch(updateSeat({busId,busData:formData}))
    }

    const getBusInfoSchema = (isVendor, t) =>
        Yup.object().shape({
          driver_id: Yup.number()
            .typeError(t('bus.driverRequired'))
            .required(t('bus.driverRequired'))
            .positive(t('bus.driverRequired'))
            .integer(t('bus.driverRequired')),
      
          vendor_id: isVendor
            ? Yup.mixed().notRequired()
            : Yup.number()
                .typeError(t('bus.vendorRequired'))
                .required(t('bus.vendorRequired'))
                .positive(t('bus.vendorRequired'))
                .integer(t('bus.vendorRequired')),
      
          name: Yup.string()
            .required(t('bus.nameRequired'))
            .min(2, t('bus.nameMin'))
            .max(50, t('bus.nameMax')),
      
          bus_number: Yup.string()
            .required(t('bus.numberRequired'))
            .matches(/^[A-Za-z0-9]+$/, t('bus.numberInvalid')),
      
          facilities: Yup.string()
            .required(t('bus.facilitiesRequired'))
            .matches(/^[A-Za-z, ]+$/, t('bus.facilitiesInvalid')),
      
          ticket_price: Yup.number()
            .typeError(t('bus.priceType'))
            .required(t('bus.priceRequired'))
            .positive(t('bus.pricePositive')),

            image: Yup.mixed()
        .test('fileOrUrl', t('bus.imageRequired'), (value) => {
          // If value is a string (URL), it's valid (editing case)
          if (typeof value === 'string' && value.trim() !== '') return true;
          // If value is a File object, it's valid (new upload case)
          if (value instanceof File) return true;
          // Otherwise invalid
          return false;
        }),
        });
      

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white/90">
                {busId ? t("EDIT_BUS") : t("ADD_BUS")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Driver ID */}
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("DRIVER")}</label>
                        <input
                            type="number"
                            name="driver_id"
                            value={formData.driver_id}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                        {errors.driver_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.driver_id}</p>
                        )}
                    </div> */}

                    <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("DRIVER")}</label>
                    <input
                        type="text"
                        placeholder={t("SEARCH_DRIVER")}
                        value={driverSearch}  // Always use driverSearch for the value
                        onChange={(e) => {
                        setDriverSearch(e.target.value);
                        setShowDriverDropdown(true);
                        if (selectedDriver && e.target.value !== `${selectedDriver.first_name} ${selectedDriver.last_name || ''}`) {
                            setSelectedDriver(null);
                            setFormData({...formData, driver_id: ''});
                        }
                        }}
                        onFocus={() => setShowDriverDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDriverDropdown(false), 200)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    {showDriverDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                        {(isVendor?drivers:driverList)
                            .filter((driver) => 
                            `${driver.first_name} ${driver.last_name || ''}`
                                .toLowerCase()
                                .includes(driverSearch.toLowerCase())
                            )
                            .map((driver) => (
                            <div
                                key={driver.id}
                                onClick={() => {
                                handleDriverSelect(driver.driver);
                                setDriverSearch(`${driver.first_name} ${driver.last_name || ''}`);
                                }}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                            >
                                {driver.first_name} {driver.last_name || ''}
                            </div>
                            ))}
                        {(isVendor?drivers:driverList).filter(driver => 
                            `${driver.first_name} ${driver.last_name || ''}`
                            .toLowerCase()
                            .includes(driverSearch.toLowerCase())
                        ).length === 0 && (
                            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                            {t("NO_DRIVERS_FOUND")}
                            </div>
                        )}
                        </div>
                    )}
                    {errors.driver_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.driver_id}</p>
                    )}
                    </div>

                    {!isVendor && (
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("VENDOR")}</label>
                            <input
                                type="text"
                                placeholder={t("SEARCH_VENDOR")}
                                value={vendorSearch}
                                onChange={(e) => {
                                    setVendorSearch(e.target.value);
                                    setShowVendorDropdown(true);
                                    if (selectedVendor && e.target.value !== `${selectedVendor.first_name} ${selectedVendor.last_name || ''}`) {
                                        setSelectedVendor(null);
                                        setFormData({...formData, vendor_id: ''});
                                    }
                                }}
                                onFocus={() => setShowVendorDropdown(true)}
                                onBlur={() => setTimeout(() => setShowVendorDropdown(false), 200)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            {showVendorDropdown && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                                    {vendorList
                                        .filter((vendor) => vendor.role === 'vendor' &&
                                            `${vendor.first_name} ${vendor.last_name || ''}`
                                                .toLowerCase()
                                                .includes(vendorSearch.toLowerCase())
                                        )
                                        .map((vendor) => (
                                            <div
                                                key={vendor.id}
                                                onClick={() => {
                                                    handleVendorSelect(vendor.vendor);
                                                    setVendorSearch(`${vendor.first_name} ${vendor.last_name || ''}`);
                                                }}
                                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                                            >
                                                {vendor.first_name} {vendor.last_name || ''}
                                            </div>
                                        ))}
                                    {vendorList.filter(vendor => vendor.role === 'vendor' &&
                                        `${vendor.first_name} ${vendor.last_name || ''}`
                                            .toLowerCase()
                                            .includes(vendorSearch.toLowerCase())
                                    ).length === 0 && (
                                        <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                                            {t("NO_VENDORS_FOUND")}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bus Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("BUS_NAME")}</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Bus Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("BUS_NUMBER")}</label>
                        <input
                            type="text"
                            name="bus_number"
                            value={formData.bus_number}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                        {errors.bus_number && (
                            <p className="text-red-500 text-sm mt-1">{errors.bus_number}</p>
                        )}
                    </div>

                    {/* Facilities */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("FACILITIES")} (comma-separated)</label>
                        <input
                            type="text"
                            name="facilities"
                            value={formData.facilities}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            placeholder="e.g., WiFi, Charging Point"
                        />
                        {errors.facilities && (
                            <p className="text-red-500 text-sm mt-1">{errors.facilities}</p>
                        )}
                    </div>

                    {/* Ticket Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("TICKET_PRICE")}</label>
                        <input
                            type="number"
                            name="ticket_price"
                            value={formData.ticket_price}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            step="0.01"
                        />
                        {errors.ticket_price && (
                            <p className="text-red-500 text-sm mt-1">{errors.ticket_price}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("STATUS")}</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Image Upload */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("BUS_IMAGE")}</label>
                        <input
                            type="file"
                            name="image"
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            accept="image/*"
                        />
                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mt-2">
                                <img
                                    src={imagePreview}
                                    alt="Bus Preview"
                                    className="w-32 h-32 object-cover rounded-md"
                                />
                            </div>
                        )}
                        {errors.image && (
                            <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                        )}
                    </div>

                    {/* Berth Type Configuration */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setOpenDialog(true)}
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                {t("CONFIGURE_BERTH")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2 lg:col-span-3">
                    <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                        {busId ? t("EDIT_BUS") : t("ADD_BUS")}
                    </button>
                </div>
            </form>

            {/* Dialog for Berth Configuration */}
            {openDialog && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col dark:bg-gray-800 overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4 dark:text-white/90">
                            {formData.berth_type === 'lower' ? t("CONFIGURE_LOWER_BERTH") : t("CONFIGURE_UPPER_BERTH") }
                        </h3>
                        <div className="flex flex-row gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("BERTH_TYPE")}</label>
                                <select
                                    name="berth_type"
                                    value={formData.berth_type}
                                    onChange={handleBerthChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                >
                                    <option value="">{t("SELECT_BERTH_TYPE")}</option>
                                    <option value="lower">Lower Berth</option>
                                    <option value="upper">Upper Berth</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("ROWS")}</label>
                                <input
                                    type="number"
                                    name="rows"
                                    value={formData.rows}
                                    onChange={handleBerthChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("COLUMNS")}</label>
                                <input
                                    type="number"
                                    name="columns"
                                    value={formData.columns}
                                    onChange={handleBerthChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            {/* Seat Layout Preview */}
                            {generateSeatLayout(formData.rows, formData.columns)}
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                        {busId && (
                            <button
                                onClick={handleSaveChangeSeat}
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                {t("SAVE_CHANGE")}
                            </button>
                        )}
                            <button
                                type="button"
                                onClick={() => setOpenDialog(false)}
                                className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-500 dark:hover:bg-gray-600"
                            >
                                {t("CLOSE")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog for Seat Details */}
            {selectedSeat && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm dark:bg-gray-800">
                        <h3 className="text-lg font-semibold mb-4 dark:text-white/90">
                        {t("EDIT_SEAT")} {selectedSeat.row}-{selectedSeat.column}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                            {/* Seat Number (Read-Only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("SEAT_NUMBER")}</label>
                                <input
                                onChange={(e) => {
                                    const seatNumber = e.target.value;
                                    const rowChar = seatNumber.charAt(0).toUpperCase();  // First character is the row (A, B, C, etc.)
                                    const columnNumber = seatNumber.slice(1);             // The remaining part is the column (1, 2, 3, etc.)

                                    // Convert rowChar (e.g., 'A' -> 1, 'B' -> 2, etc.)
                                    const row = rowChar.charCodeAt(0) - 64;  // 'A' -> 1, 'B' -> 2, etc.

                                    // Construct seat_number as a combination of row and column, for example: 'A1' becomes 11, 'B2' becomes 21
                                    const seatNumberInt = parseInt(`${row}${columnNumber}`, 10);

                                    // Update the state with the parsed seat_number
                                    setSelectedSeat({...selectedSeat, seat_number: seatNumberInt });
                                }}
                                    type="text"
                                    value={`${String.fromCharCode(64 + selectedSeat.row)}${selectedSeat.column}`}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-100"
                                    
                                />
                            </div>

                            {/* Price Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("PRICE")}</label>
                                <input
                                    type="number"
                                    value={selectedSeat.price || ''}
                                    onChange={(e) =>
                                        setSelectedSeat({ ...selectedSeat, price: parseFloat(e.target.value) })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                            </div>

                            {/* Seat Type Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("SEAT_TYPE")}</label>
                                <select
                                    value={selectedSeat.seat_type || ''}
                                    onChange={(e) =>
                                        setSelectedSeat({ ...selectedSeat, seat_type: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                >
                                    <option value="">{t("SELECT_SEAT_TYPE")}</option>
                                    <option value="window">Window</option>
                                    <option value="aisle">Aisle</option>
                                    <option value="middle">Middle</option>
                                    <option value="driver">Driver</option>
                                </select>
                            </div>

                            {/* Seat Class Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("SEAT_CLASS")}</label>
                                <select
                                    value={selectedSeat.seat_class || ''}
                                    onChange={(e) =>
                                        setSelectedSeat({ ...selectedSeat, seat_class: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                >
                                    <option value="">{t("SELECT_SEAT_CLASS")}</option>
                                    <option value="economic">Economic</option>
                                    <option value="business">Business</option>
                                    <option value="premium">Premium</option>
                                    <option value="vip">VIP</option>
                                </select>
                            </div>

                            {/* Is Recliner? Radio Buttons */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("IS_RECLINER?")}</label>
                                <div className="mt-1 flex gap-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="is_recliner"
                                            value={0}
                                            checked={selectedSeat.is_recliner === 0}
                                            onChange={(e) =>
                                                setSelectedSeat({ ...selectedSeat, is_recliner: parseInt(e.target.value) })
                                            }
                                            className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t("NO")}</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="is_recliner"
                                            value={1}
                                            checked={selectedSeat.is_recliner === 1}
                                            onChange={(e) =>
                                                setSelectedSeat({ ...selectedSeat, is_recliner: parseInt(e.target.value) })
                                            }
                                            className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t("YES")}</span>
                                    </label>
                                </div>
                            </div>

                            {/* Is Sleeper? Radio Buttons */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("IS_SLEEPER?")}</label>
                                <div className="mt-1 flex gap-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="is_sleeper"
                                            value={0}
                                            checked={selectedSeat.is_sleeper === 0}
                                            onChange={(e) =>
                                                setSelectedSeat({ ...selectedSeat, is_sleeper: parseInt(e.target.value) })
                                            }
                                            className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t("NO")}</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="is_sleeper"
                                            value={1}
                                            checked={selectedSeat.is_sleeper === 1}
                                            onChange={(e) =>
                                                setSelectedSeat({ ...selectedSeat, is_sleeper: parseInt(e.target.value) })
                                            }
                                            className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t("YES")}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setSelectedSeat(null)}
                                className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-500 dark:hover:bg-gray-600"
                            >
                                {t("CANCEL")}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSeatSave(selectedSeat)}
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                            >
                                {t("SAVE")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddBus;