import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { createBooking } from '../../store/slices/bookingSlice';
import { fetchActiveTrips, fetchTrips, showTrip } from '../../store/slices/tripSlice';
import { fetchBusById } from '../../store/slices/busSlice';
import Swal from 'sweetalert2';

const AddBooking = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { trips,activeTrips, loading,selectedTrip } = useSelector((state) => state.trips);
    const {bus}=useSelector((state)=>state.buses)
    const [trip, setTrip] = useState(null);
    const [ticketPrices,setTicketPrices]=useState(null)

    const [formData, setFormData] = useState({
        trip_id: '',
        is_partial_payment: '0',
        amount: 0,
        customer_mobile: '',
        customer_first_name: '',
        customer_last_name: '',
        tickets: []
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Fetch trips when component mounts or search term changes
    useEffect(() => {
        dispatch(fetchActiveTrips({ search: searchTerm }));
    }, [dispatch, searchTerm]);

    // Set trip when selectedTrip changes
    useEffect(() => {
        if (selectedTripId) {
            dispatch(showTrip({ trip_id: selectedTripId }));
        }
    }, [selectedTripId, dispatch]);

    useEffect(() => {
        if (selectedTrip && selectedTrip.bus && selectedTrip.bus.id) {
            setTrip(selectedTrip);  // Set the trip data
            setTicketPrices(selectedTrip?.seat_prices);  // Set the seat prices
            dispatch(fetchBusById(selectedTrip.bus.id));  // Fetch the bus details
        }
    }, [selectedTrip, dispatch]);

    
    
    

    // useEffect(()=>{
    //     setTrip(selectedTrip)
    //     setTicketPrices(selectedTrip?.seat_prices)
    // },[dispatch,selectedTrip,selectedTripId])


    // Calculate total amount when selected seats change
    useEffect(() => {
        const totalAmount = selectedSeats.reduce((sum, seat) => {
            const seatPrice = ticketPrices?.find(tp => tp.seat_number === seat.seat_number);
            return sum + (seatPrice ? Number(seatPrice.ticket_price) : 0);
        }, 0);
        setFormData(prev => ({ ...prev, amount: totalAmount }));
    }, [selectedSeats, ticketPrices]);
    

    // Format trips for react-select
    const tripOptions = activeTrips.map(trip => ({
        value: trip.id,
        label: `${trip?.route?.origin_station?.name} → ${trip?.route?.destination_station?.name} - ${new Date(trip.departure_time).toLocaleString()} (${trip.bus?.name})`
    }));

    // Handle trip selection
    const handleTripSelect = (selectedOption) => {
        setFormData({...formData,trip_id:selectedOption.value})
        setSelectedTripId(selectedOption.value);
        setSelectedSeats([]); // Clear selected seats when trip changes
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle seat selection
    const handleSeatSelect = (seat) => {
        setSelectedSeats(prev => {
            // Check if the seat is already selected by comparing seat_number
            const isAlreadySelected = prev.some(s => s.seat_number === seat.seat_number);
            
            if (isAlreadySelected) {
                return prev.filter(s => s.seat_number !== seat.seat_number);
            } else {
                return [...prev, {
                    trip_seat_price_id: seat.trip_seat_price_id,
                    price: seat.price,
                    seat_number: seat.seat_number,
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    national_id: '',
                    birthday: '',
                    gender: 'male'
                }];
            }
        });
    };

    // Handle passenger info changes
    const handlePassengerChange = (index, field, value) => {
        setSelectedSeats(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // Form validation schema
    const bookingSchema = Yup.object().shape({
        trip_id: Yup.number()
            .required(t('booking.tripRequired'))
            .positive(t('booking.tripRequired')),
        customer_mobile: Yup.string()
            .required(t('booking.mobileRequired')),
        customer_first_name: Yup.string()
            .required(t('booking.firstNameRequired')),
        customer_last_name: Yup.string()
            .required(t('booking.lastNameRequired')),
        tickets: Yup.array()
            .min(1, t('booking.atLeastOneSeat'))
            .of(
                Yup.object().shape({
                    first_name: Yup.string().required(t('booking.passengerFirstNameRequired')),
                    last_name: Yup.string().required(t('booking.passengerLastNameRequired')),
                    phone: Yup.string().required(t('booking.passengerPhoneRequired')),
                    gender: Yup.string().required(t('booking.passengerGenderRequired')),
                    trip_seat_price_id: Yup.number().required().positive()
                })
            )
    });

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            // Prepare tickets data
            const ticketsData = selectedSeats.map(seat => ({
                first_name: seat.first_name,
                last_name: seat.last_name,
                email: seat.email || '',
                phone: seat.phone,
                national_id: seat.national_id || '',
                birthday: seat.birthday || '',
                gender: seat.gender,
                trip_seat_price_id: seat.trip_seat_price_id
            }));
    
            const bookingData = {
                ...formData,
                tickets: ticketsData
            };
    
            // Validate form data
            await bookingSchema.validate(bookingData, { abortEarly: false });
            
            // Submit booking
            const resultAction = await dispatch(createBooking(bookingData));

        if (createBooking.fulfilled.match(resultAction)) {
            Swal.fire({
                title: 'Booking Successful',
                text: 'Your booking has been successfully created!',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/bookings'); // Navigate after user clicks OK
            });
        }  
    
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const newErrors = {};
                error.inner.forEach(err => {
                    newErrors[err.path] = err.message;
                });
                setErrors(newErrors);
            } else {
                // Show error dialog
                Swal.fire({
                    title: 'Booking Failed',
                    text: error.message || 'An error occurred while processing your booking',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const tooltipContent = (seat) => (
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">Type</td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                seat.seat_type === 'window' ? 'bg-blue-100 text-blue-800' :
                                seat.seat_type === 'aisle' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {seat.seat_type || 'N/A'}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">Class</td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                seat.seat_class === 'economic' ? 'bg-purple-100 text-purple-800' :
                                seat.seat_class === 'business' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {seat.seat_class || 'N/A'}
                            </span>
                        </td>
                    </tr>
                    {/* <tr>
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">Status</td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                isBooked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                                {isBooked ? 'Booked' : 'Available'}
                            </span>
                        </td>
                    </tr> */}
                    <tr>
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">Recliner</td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                            {seat.is_recliner ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Yes
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    No
                                </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">Sleeper</td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                            {seat.is_sleeper ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Yes
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    No
                                </span>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    ) ;

    // Render seat layout
    const renderSeatLayout = () => {
        if (!selectedTripId||!bus?.seats) return null;
    
        const { rows, columns, seats } = bus.seats;
        
        const leftSeats = Math.ceil(columns / 2);
        const rightSeats = columns - leftSeats;
    
        return (
            <div className="grid gap-4 mt-4">
                {Array.from({ length: rows }, (_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-4 justify-between mb-2 bg-gray-100 rounded-md p-2">
                        {/* Left side seats */}
                        <div className="flex gap-2">
                            {Array.from({ length: leftSeats }, (_, colIndex) => {
                                const seatNumber = colIndex + 1;
                                const seat = seats.find(s => s.row === rowIndex + 1 && s.column === seatNumber);
                                const _seatNumber = parseInt(`${rowIndex + 1}${colIndex + 1}`);
                                const seat_price = ticketPrices?.find(s => s.seat_number == _seatNumber);
                                const isSelected = selectedSeats.some(s => s.seat_number === _seatNumber);
                                const isBooked = !seat_price?.is_avaiable;
    
                                if (!seat) return null;
    
                                return (
                                    <div key={`left-${colIndex}`} className="relative group">
                                        <button
                                            type="button"
                                            disabled={isBooked}
                                            onClick={() => handleSeatSelect({
                                                ...seat,
                                                trip_seat_price_id: seat_price?.id,
                                                price: seat_price?.ticket_price,
                                                seat_number: _seatNumber
                                            })}
                                            className={`w-20 h-16 rounded-md p-1 flex flex-col items-center justify-center 
                                                ${isBooked ? 'bg-red-200 cursor-not-allowed' : 
                                                 isSelected ? 'bg-green-200' : 'bg-white border border-gray-300'}
                                                hover:${isBooked ? '' : 'bg-blue-100'}`}
                                        >
                                            <span className="text-xs font-medium">
                                                {String.fromCharCode(65 + rowIndex)}{seatNumber}
                                            </span>
                                            {seat_price && (
                                                <span className="text-xs">{seat_price.ticket_price}</span>
                                            )}
                                        </button>
                                        <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-200 p-2 rounded shadow-lg w-48 text-left">
                                            {tooltipContent(seat)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
    
                        {/* Aisle space */}
                        <div className="w-8"></div>
    
                        {/* Right side seats */}
                        <div className="flex gap-2">
                            {Array.from({ length: rightSeats }, (_, colIndex) => {
                                const seatNumber = leftSeats + colIndex + 1;
                                const seat = seats.find(s => s.row === rowIndex + 1 && s.column === seatNumber);
                                const _seatNumber = parseInt(`${rowIndex + 1}${seatNumber}`);
                                const seat_price = ticketPrices?.find(s => s.seat_number == _seatNumber);
                                const isSelected = selectedSeats.some(s => s.seat_number === _seatNumber);
                                const isBooked = !seat_price?.is_avaiable;
    
                                if (!seat) return null;
    
                                return (
                                    <div key={`right-${colIndex}`} className="relative group">
                                        <button
                                            type="button"
                                            disabled={isBooked}
                                            onClick={() => handleSeatSelect({
                                                ...seat,
                                                trip_seat_price_id: seat_price?.id,
                                                price: seat_price?.ticket_price,
                                                seat_number: _seatNumber
                                            })}
                                            className={`w-20 h-16 rounded-md p-1 flex flex-col items-center justify-center 
                                                ${isBooked ? 'bg-red-200 cursor-not-allowed' : 
                                                 isSelected ? 'bg-green-200' : 'bg-white border border-gray-300'}
                                                hover:${isBooked ? '' : 'bg-blue-100'}`}
                                        >
                                            <span className="text-xs font-medium">
                                                {String.fromCharCode(65 + rowIndex)}{seatNumber}
                                            </span>
                                            {seat_price && (
                                                <span className="text-xs">{seat_price.ticket_price}</span>
                                            )}
                                        </button>
                                        <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-200 p-2 rounded shadow-lg w-48 text-left">
                                            {tooltipContent(seat)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Render passenger forms for selected seats
    const renderPassengerForms = () => {
        return selectedSeats.map((seat, index) => (
            <div key={seat.trip_seat_price_id} className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="text-lg font-medium mb-3">
                    {t('booking.passengerInfo')} - Seat {seat.seat_number}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.firstName')} *
                        </label>
                        <input
                            type="text"
                            value={seat.first_name}
                            onChange={(e) => handlePassengerChange(index, 'first_name', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                        {errors[`tickets[${index}].first_name`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`tickets[${index}].first_name`]}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.lastName')} *
                        </label>
                        <input
                            type="text"
                            value={seat.last_name}
                            onChange={(e) => handlePassengerChange(index, 'last_name', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                        {errors[`tickets[${index}].last_name`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`tickets[${index}].last_name`]}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.email')}
                        </label>
                        <input
                            type="email"
                            value={seat.email}
                            onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.phone')} *
                        </label>
                        <input
                            type="tel"
                            value={seat.phone}
                            onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                        {errors[`tickets[${index}].phone`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`tickets[${index}].phone`]}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.nationalId')}
                        </label>
                        <input
                            type="text"
                            value={seat.national_id}
                            onChange={(e) => handlePassengerChange(index, 'national_id', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.birthday')}
                        </label>
                        <input
                            type="date"
                            value={seat.birthday}
                            onChange={(e) => handlePassengerChange(index, 'birthday', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.gender')} *
                        </label>
                        <select
                            value={seat.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            <option value="male">{t('booking.male')}</option>
                            <option value="female">{t('booking.female')}</option>
                            <option value="other">{t('booking.other')}</option>
                        </select>
                        {errors[`tickets[${index}].gender`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`tickets[${index}].gender`]}</p>
                        )}
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">{t('booking.newBooking')}</h1>
    
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                {/* Grid Container: Information (Left) + Seat Layout (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT COLUMN - Booking Info */}
                    <div className="space-y-6">
                        {/* Trip Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('booking.selectTrip')} *
                            </label>
                            <Select
                                options={tripOptions}
                                value={selectedTripId ? tripOptions.find(option => option.value === selectedTripId) : null}
                                onChange={handleTripSelect}
                                onInputChange={setSearchTerm}
                                placeholder={t('booking.searchTrip')}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                isSearchable
                                isLoading={loading}
                                noOptionsMessage={() => t('booking.noTripsFound')}
                            />
                            {errors.trip_id && (
                                <p className="text-red-500 text-xs mt-1">{errors.trip_id}</p>
                            )}
                        </div>
    
                        {/* Trip Information */}
                        {(trip && selectedTripId) && (
                            <div className="p-4 bg-blue-50 rounded-md">
                                <h2 className="text-xl font-semibold mb-2">{t('booking.tripDetails')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="font-medium">{t('booking.route')}</p>
                                        <p>{trip?.route?.name} → {trip.end_point}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">{t('booking.departure')}</p>
                                        <p>{new Date(trip.departure_time).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">{t('booking.bus')}</p>
                                        <p>{trip.bus?.name} ({trip.bus?.bus_number})</p>
                                    </div>
                                </div>
                            </div>
                        )}
    
                        {/* Passenger Info */}
                        {selectedSeats.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">{t('booking.passengerDetails')}</h2>
                                {renderPassengerForms()}
                            </div>
                        )}
    
                        {/* Customer Info */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">{t('booking.customerDetails')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('booking.firstName')} *
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_first_name"
                                        value={formData.customer_first_name}
                                        onChange={handleChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.customer_first_name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.customer_first_name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('booking.lastName')} *
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_last_name"
                                        value={formData.customer_last_name}
                                        onChange={handleChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.customer_last_name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.customer_last_name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('booking.mobile')} *
                                    </label>
                                    <input
                                        type="tel"
                                        name="customer_mobile"
                                        value={formData.customer_mobile}
                                        onChange={handleChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.customer_mobile && (
                                        <p className="text-red-500 text-xs mt-1">{errors.customer_mobile}</p>
                                    )}
                                </div>
                            </div>
                        </div>
    
                        {/* Payment Info */}
                        <div className="p-4 bg-gray-50 rounded-md">
                            <h2 className="text-xl font-semibold mb-4">{t('booking.paymentDetails')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('booking.paymentType')}
                                    </label>
                                    <select
                                        name="is_partial_payment"
                                        value={formData.is_partial_payment}
                                        onChange={handleChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="0">{t('booking.fullPayment')}</option>
                                        <option value="1">{t('booking.partialPayment')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('booking.totalAmount')}
                                    </label>
                                    <input
                                        type="text"
                                        value={`$${formData.amount.toFixed(2)}`}
                                        readOnly
                                        className="w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
    
                    {/* RIGHT COLUMN - Seat Layout */}
                    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 max-h-[700px] overflow-y-auto">
                    <h2 className="text-xl font-semibold mb-4">{t('booking.selectSeats')}</h2>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-200 mr-2"></div>
                                <span>{t('booking.selected')}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-red-200 mr-2"></div>
                                <span>{t('booking.booked')}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-white border border-gray-300 mr-2"></div>
                                <span>{t('booking.available')}</span>
                            </div>
                        </div>
                        {renderSeatLayout()}
                        {errors.tickets && (
                            <p className="text-red-500 text-sm mt-2">{errors.tickets}</p>
                        )}
                    </div>
                </div>
    
                {/* Submit Button */}
                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading || selectedSeats.length === 0 || !selectedTrip}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t('booking.creating') : t('booking.createBooking')}
                    </button>
                </div>
            </form>
        </div>
    );
    
    
};

export default AddBooking;