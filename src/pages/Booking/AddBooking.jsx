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
import { formatSeatNumber } from '../../utils/utils';
import PersianDateText from '../../utils/persianDateShowFormat';

const AddBooking = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { trips,activeTrips, loading,selectedTrip } = useSelector((state) => state.trips);
    const {bus}=useSelector((state)=>state.buses)
    const [trip, setTrip] = useState(null);
    const [ticketPrices,setTicketPrices]=useState(null)
    const [minPartialAmount,setMinPartialAmount]=useState(0)
    const [partialAmountType,setPartialAmountType]=useState("")
    const [totalAmount,setTotalAmount]=useState(0)
    const [useCustomerInfo, setUseCustomerInfo] = useState(false);

    const [formData, setFormData] = useState({
        trip_id: '',
        is_partial_payment: '0',
        amount: 0,
        customer_mobile: '',
        customer_first_name: '',
        customer_last_name: '',
        tickets: [],
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [errors, setErrors] = useState({});
    const [amountError, setAmountError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchActiveTrips({ search: searchTerm }));
    }, [dispatch, searchTerm]);

    useEffect(() => {
        if (selectedTripId) {
            dispatch(showTrip({ trip_id: selectedTripId }));
        }
    }, [selectedTripId, dispatch]);

    useEffect(() => {
        if (selectedTrip && selectedTrip.bus && selectedTrip.bus.id) {
            setTrip(selectedTrip);
            setFormData(prev => ({
                ...prev,
                is_partial_payment: String(selectedTrip.allow_partial_payment || '0'),
                amount: selectedTrip.allow_partial_payment === "1" ? 
                    (selectedTrip.partial_payment_type === "total" ? 
                        selectedTrip.min_partial_payment : 
                        selectedTrip.min_partial_payment * 0)
                    : 0
            }));
            setMinPartialAmount(selectedTrip.min_partial_payment);
            setPartialAmountType(selectedTrip.partial_payment_type);
            setTicketPrices(selectedTrip?.seat_prices);
            dispatch(fetchBusById(selectedTrip.bus.id));
        }
    }, [selectedTrip, dispatch]);

    useEffect(() => {
        const totalAmount = selectedSeats.reduce((sum, seat) => {
            const seatPrice = ticketPrices?.find(tp => tp.seat_number === seat.seat_number);
            return sum + (seatPrice ? Number(seatPrice.ticket_price) : 0);
        }, 0);
        setTotalAmount(totalAmount);

        if (formData.is_partial_payment !== "1") {
            setFormData(prev => ({ 
                ...prev, 
                amount: totalAmount,
            }));
        } else {
            let partialAmount = 0;
            if (partialAmountType === "total") {
                partialAmount = minPartialAmount;
            } else if (partialAmountType === "per_seat") {
                partialAmount = minPartialAmount * selectedSeats.length;
            }
            setFormData(prev => ({ 
                ...prev, 
                amount: Math.min(partialAmount, totalAmount),
            }));
        }
    }, [selectedSeats, ticketPrices, formData.is_partial_payment, minPartialAmount, partialAmountType]);

    useEffect(() => {
        if (useCustomerInfo && formData.customer_first_name && formData.customer_last_name && formData.customer_mobile) {
            const updatedSeats = selectedSeats.map(seat => ({
                ...seat,
                first_name: formData.customer_first_name,
                last_name: formData.customer_last_name,
                phone: formData.customer_mobile
            }));
            setSelectedSeats(updatedSeats);
        }
    }, [useCustomerInfo, formData.customer_first_name, formData.customer_last_name, formData.customer_mobile]);
    
    const tripOptions = activeTrips.map(trip => ({
        value: trip.id,
        // label: `${trip?.route?.origin_station?.name} → ${trip?.route?.destination_station?.name} - ${new Date(trip.departure_time).toLocaleString()} (${trip.bus?.name})`
label: (
  <>
    {trip?.route?.origin_station?.name} → {trip?.route?.destination_station?.name} - 
    <PersianDateText value={trip.departure_time} /> ({trip.bus?.name})
  </>
)
    }));

    const handleTripSelect = (selectedOption) => {
        setFormData({...formData,trip_id:selectedOption.value})
        setSelectedTripId(selectedOption.value);
        setSelectedSeats([]);
        setErrors({})
        setAmountError("")
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAmountChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        
        if (formData.is_partial_payment === "1") {
            const minAmount = partialAmountType === "total" ? 
                minPartialAmount : 
                minPartialAmount * selectedSeats.length;
            
            if (value < minAmount) {
                setAmountError(`Amount must be at least ${minAmount}`);
            } else if (value > totalAmount) {
                setAmountError(`Amount cannot exceed total ${totalAmount}`);
            } else {
                setAmountError('');
            }
        } else {
            setAmountError('');
        }
    
        setFormData({
            ...formData,
            amount: formData.is_partial_payment === "1" ? value : totalAmount,
        });
    };

    const handleSeatSelect = (seat) => {
        setSelectedSeats(prev => {
            const isAlreadySelected = prev.some(s => s.seat_number === seat.seat_number);
            
            if (isAlreadySelected) {
                return prev.filter(s => s.seat_number !== seat.seat_number);
            } else {
                return [...prev, {
                    trip_seat_price_id: seat.trip_seat_price_id,
                    price: seat.price,
                    seat_number: seat.seat_number,
                    first_name: useCustomerInfo ? formData.customer_first_name : '',
                    last_name: useCustomerInfo ? formData.customer_last_name : '',
                    email: '',
                    phone: useCustomerInfo ? formData.customer_mobile : '',
                    national_id: '',
                    birthday: '',
                    gender: 'male',
                    is_child: 0
                }];
            }
        });
    };

    const handlePassengerChange = (index, field, value) => {
        setSelectedSeats(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

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
                })
            ),
            amount: Yup.number()
            .required(t('booking.amountRequired'))
            .test(
                'amount-validation',
                t('booking.amountInvalid'),
                function(value) {
                    const { is_partial_payment } = this.parent;
                    
                    if (is_partial_payment === "1") {
                        const minAmount = partialAmountType === "total" 
                            ? minPartialAmount 
                            : minPartialAmount * selectedSeats.length;
                        
                        return value >= minAmount && value <= totalAmount;
                    } else {
                        return value === totalAmount;
                    }
                }
            )
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            const ticketsData = selectedSeats.map(seat => ({
                first_name: seat.first_name,
                last_name: seat.last_name,
                email: seat.email || '',
                phone: seat.phone,
                national_id: seat.national_id || '',
                birthday: seat.birthday || '',
                gender: seat.gender,
                trip_seat_price_id: seat.trip_seat_price_id,
                is_child: seat.is_child || 0
            }));
    
            const bookingData = {
                ...formData,
                tickets: ticketsData
            };
            
            await bookingSchema.validate(bookingData, { abortEarly: false });
            if(bookingData.is_partial_payment==="0"){
                bookingData.amount=0
            }

            const resultAction = await dispatch(createBooking(bookingData));

        if (createBooking.fulfilled.match(resultAction)) {
            Swal.fire({
                title: t('success'),
                text: t('bookingSuccess'),
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/bookings');
            });
        }
    
        } catch (error) {
            console.log(error)
            if (error instanceof Yup.ValidationError) {
                const newErrors = {};
                error.inner.forEach(err => {
                    newErrors[err.path] = err.message;
                });
                setErrors(newErrors);
            } else {
                Swal.fire({
                    title: t('error'),
                    text: error || t('bookingFailed'),
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const tooltipContent = (seat) => (
        <div className="p-2 bg-white border border-gray-200 rounded-md shadow-sm text-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                        <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">Type</td>
                        <td className="px-2 py-1 whitespace-nowrap text-gray-500">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                                seat.seat_type === 'window' ? 'bg-blue-100 text-blue-800' :
                                seat.seat_type === 'aisle' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {seat.seat_type || 'N/A'}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">Class</td>
                        <td className="px-2 py-1 whitespace-nowrap text-gray-500">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                                seat.seat_class === 'economic' ? 'bg-purple-100 text-purple-800' :
                                seat.seat_class === 'business' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {seat.seat_class || 'N/A'}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">Recliner</td>
                        <td className="px-2 py-1 whitespace-nowrap text-gray-500">
                            {seat.is_recliner ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                                    Yes
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                                    No
                                </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">Sleeper</td>
                        <td className="px-2 py-1 whitespace-nowrap text-gray-500">
                            {seat.is_sleeper ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                                    Yes
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                                    No
                                </span>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    const renderSeatLayout = () => {
        if (!selectedTripId||!bus?.seats) return null;
    
        const { rows, columns, seats } = bus.seats;
        
        const leftSeats = Math.ceil(columns / 2);
        const rightSeats = columns - leftSeats;
    
        return (
            <div className="grid gap-3 mt-3">
                {Array.from({ length: rows }, (_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-3 justify-between mb-2 bg-gray-100 rounded p-2">
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
                                            className={`w-14 h-12 rounded-sm p-1 flex flex-col items-center justify-center text-sm ${
                                                isBooked ? 'bg-red-200 cursor-not-allowed' : 
                                                isSelected ? 'bg-green-200' : 'bg-white border border-gray-300'
                                            } hover:${isBooked ? '' : 'bg-blue-100'}`}
                                        >
                                            <span className="font-medium text-xs">
                                                {String.fromCharCode(65 + rowIndex)}{seatNumber}
                                            </span>
                                            {seat_price && (
                                                <span className="text-xs">{seat_price.ticket_price}</span>
                                            )}
                                        </button>
                                        <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-200 p-2 rounded shadow-sm w-40 text-left">
                                            {tooltipContent(seat)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
    
                        <div className="w-6"></div>
    
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
                                            className={`w-14 h-12 rounded-sm p-1 flex flex-col items-center justify-center text-sm ${
                                                isBooked ? 'bg-red-200 cursor-not-allowed' : 
                                                isSelected ? 'bg-green-200' : 'bg-white border border-gray-300'
                                            } hover:${isBooked ? '' : 'bg-blue-100'}`}
                                        >
                                            <span className="font-medium text-xs">
                                                {String.fromCharCode(65 + rowIndex)}{seatNumber}
                                            </span>
                                            {seat_price && (
                                                <span className="text-xs">{seat_price.ticket_price}</span>
                                            )}
                                        </button>
                                        <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-200 p-2 rounded shadow-sm w-40 text-left">
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

    const renderPassengerForms = () => {
        return selectedSeats.map((seat, index) => (
            <div key={seat.trip_seat_price_id} className="bg-gray-50 p-3 rounded-sm mb-3 text-base">
                <h3 className="text-base font-medium mb-2">
                    {t('booking.passengerInfo')} - Seat {formatSeatNumber(seat.seat_number)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.firstName')} *
                        </label>
                        <input
                            type="text"
                            value={seat.first_name}
                            onChange={(e) => handlePassengerChange(index, 'first_name', e.target.value)}
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
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
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
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
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
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
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
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
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
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
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('booking.gender')} *
                        </label>
                        <select
                            value={seat.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('is_child')}
                        </label>
                        <select
                            value={seat.is_child}
                            onChange={(e) => handlePassengerChange(index, 'is_child', e.target.value)}
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
                        >
                            <option value="0">{t('no')}</option>
                            <option value="1">{t('yes')}</option>
                        </select>
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <div className="container mx-auto px-4 py-6 text-base">
            <h1 className="text-xl font-bold mb-4">{t('booking.newBooking')}</h1>
    
            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
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
                                className="basic-multi-select text-sm"
                                classNamePrefix="select"
                                isSearchable
                                isLoading={loading}
                                noOptionsMessage={() => t('booking.noTripsFound')}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '36px'
                                    }),
                                    dropdownIndicator: (base) => ({
                                        ...base,
                                        padding: '6px'
                                    }),
                                    clearIndicator: (base) => ({
                                        ...base,
                                        padding: '6px'
                                    }),
                                    valueContainer: (base) => ({
                                        ...base,
                                        padding: '2px 8px'
                                    }),
                                    input: (base) => ({
                                        ...base,
                                        margin: '0px',
                                        padding: '0px'
                                    })
                                }}
                            />
                            {errors.trip_id && (
                                <p className="text-red-500 text-xs mt-1">{errors.trip_id}</p>
                            )}
                        </div>
    
                        {(trip && selectedTripId) && (
                            <div className="p-3 bg-blue-50 rounded-lg text-sm">
                                <h2 className="text-base font-semibold mb-2">{t('booking.tripDetails')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <p className="font-medium">{t('booking.route')}</p>
                                        <p>{trip?.route?.name} → {trip.end_point}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">{t('booking.departure')}</p>
                                        {/* <p>{new Date(trip.departure_time).toLocaleString()}</p> */}
                                        {<PersianDateText value={trip.departure_time} />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{t('booking.bus')}</p>
                                        <p>{trip.bus?.name} ({trip.bus?.bus_number})</p>
                                    </div>
                                </div>
                            </div>
                        )}

                         <div>
                            <h2 className="text-base font-semibold mb-3">{t('booking.customerDetails')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('booking.firstName')} *
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_first_name"
                                        value={formData.customer_first_name}
                                        onChange={handleChange}
                                        className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
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
                                        className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
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
                                        className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
                                        required
                                    />
                                    {errors.customer_mobile && (
                                        <p className="text-red-500 text-xs mt-1">{errors.customer_mobile}</p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={useCustomerInfo}
                                        onChange={(e) => setUseCustomerInfo(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        {t('booking.useCustomerInfoForPassengers')}
                                    </span>
                                </label>
                            </div>
                        </div>
    
                        {selectedSeats.length > 0 && (
                            <div>
                                <h2 className="text-base font-semibold mb-3">{t('booking.passengerDetails')}</h2>
                                {renderPassengerForms()}
                            </div>
                        )}
    
                       
    
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                            <h2 className="text-base font-semibold mb-3">{t('booking.paymentDetails')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('booking.paymentType')}
                                    </label>
                                    <input 
                                        className="w-full rounded border-gray-300 shadow-sm bg-gray-100 text-sm p-2"
                                        value={(formData.is_partial_payment === "1")
                                            ? t("booking.partialPayment")
                                            : t("booking.fullPayment")}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('booking.paymentAmount')} 
                                        {formData.is_partial_payment === "1" && (
                                            <span className="text-xs text-gray-500">
                                                (Min: {partialAmountType === "total" ? 
                                                    minPartialAmount : 
                                                    `${minPartialAmount} × ${selectedSeats.length} = ${minPartialAmount * selectedSeats.length}`})
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleAmountChange}
                                        min={formData.is_partial_payment === "1" ? 
                                            (partialAmountType === "total" ? minPartialAmount : minPartialAmount * selectedSeats.length) 
                                            : totalAmount}
                                        max={totalAmount}
                                        disabled={formData.is_partial_payment !== "1"}
                                        className={`w-full rounded border-gray-300 shadow-sm text-sm p-2 ${
                                            formData.is_partial_payment !== "1" ? 'bg-gray-100' : ''
                                        }`}
                                    />
                                    {amountError && (
                                        <p className="text-red-500 text-xs mt-1">{amountError}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('booking.totalAmount')} 
                                    </label>
                                    <input
                                        readOnly
                                        type="text"
                                        value={totalAmount}
                                        className="w-full rounded border-gray-300 shadow-sm bg-gray-100 text-sm p-2"
                                    />
                                </div>
                                {formData.is_partial_payment === "1" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('booking.remainingAmount')} 
                                        </label>
                                        <input
                                            readOnly
                                            type="text"
                                            value={totalAmount - formData.amount}
                                            className="w-full rounded border-gray-300 shadow-sm bg-gray-100 text-sm p-2"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
    
                    <div className="p-4 bg-white rounded-lg shadow border border-gray-200 max-h-[600px] overflow-y-auto">
                        <h2 className="text-base font-semibold mb-3">{t('booking.selectSeats')}</h2>
                        <div className="flex items-center gap-3 mb-3 text-sm">
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
    
                <div className="mt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading || selectedSeats.length === 0 || !selectedTrip}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isLoading ? t('booking.creating') : t('booking.createBooking')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddBooking;