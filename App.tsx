import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { IFormData } from './types';
import TermsAndConditions from './components/TermsAndConditions';
import logoHKF from './logo/HKF-W.png';
// const logoHKF = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233B82F6'/%3E%3Ctext x='50' y='62' font-size='40' fill='white' text-anchor='middle' font-family='sans-serif' font-weight='bold'%3EHKF%3C/text%3E%3C/svg%3E";

const initialFormData: IFormData = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: '',
  address: '',
  postalCode: '',
  city: '',
  phone: '',
  email: '',
  entryDate: new Date().toISOString().split('T')[0],
  sepaGender: '',
  sepaFirstName: '',
  sepaLastName: '',
  sepaAddress: '',
  sepaPostalCode: '',
  sepaCity: '',
  iban: '',
  sepaEntryDate: new Date().toISOString().split('T')[0],
};


const FormField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string; error?: string; required?: boolean; }> = ({ label, name, value, onChange, placeholder, type = 'text', error, required }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleIconClick = () => {
        if (inputRef.current?.showPicker) {
            inputRef.current.showPicker();
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-row items-center gap-1">
                <label htmlFor={name} className="w-36 font-semibold text-gray-700 flex-shrink-0">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                 <div className="relative flex-1 w-full">
                    <input
                        ref={inputRef}
                        id={name}
                        name={name}
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder || label}
                        className={`w-full p-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-black ${error ? 'border-red-500' : 'border-gray-300'} ${type === 'date' ? 'pr-2' : ''}`}
                    />
                    {type === 'date' && (
                        <div onClick={handleIconClick} className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer">
                             <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.5a.5.5 0 000 1h11a.5.5 0 000-1h-11z" clipRule="evenodd" />
                             </svg>
                        </div>
                    )}
                </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-1 ml-36 pl-2">{error}</p>}
        </div>
    );
};

const RadioGroup: React.FC<{label: string, name: string, options: {value: string, label: string}[], selectedValue: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, error?: string, required?: boolean}> = ({ label, name, options, selectedValue, onChange, error, required }) => (
    <div className="flex flex-col">
        <div className="flex flex-row items-center gap-1">
            <p className="w-36 font-semibold text-gray-700 flex-shrink-0">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </p>
            <div className={`flex-1 flex flex-wrap gap-x-2 gap-y-1 p-1 rounded-md ${error ? 'outline outline-2 outline-offset-1 outline-red-500' : ''}`}>
                {options.map(opt => (
                    <label key={opt.value} className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                            type="radio"
                            name={name}
                            value={opt.value}
                            checked={selectedValue === opt.value}
                            onChange={onChange}
                            className="form-radio h-3.5 w-3.5 text-blue-600 transition duration-150 ease-in-out"
                        />
                        <span className="text-gray-900">{opt.label}</span>
                    </label>
                ))}
            </div>
        </div>
        {error && <p className="text-red-500 text-xs mt-1 ml-36 pl-2">{error}</p>}
    </div>
);


const App: React.FC = () => {
  const [formData, setFormData] = useState<IFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof IFormData, string>>>({});
  const [isSigned, setIsSigned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isFormCompleteAndValid, setIsFormCompleteAndValid] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  
  const validateField = useCallback((name: keyof IFormData, value: string): string => {
    const requiredFields: Array<keyof IFormData> = [
        'firstName', 'lastName', 'dob', 'gender', 'address', 'postalCode', 'city', 'phone', 'email',
        'sepaGender', 'sepaFirstName', 'sepaLastName', 'sepaAddress', 'sepaPostalCode', 'sepaCity', 'iban'
    ];
      
    if (requiredFields.includes(name) && !value.trim()) {
      return 'This field is required.';
    }

    switch (name) {
        case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return 'Please enter a valid email address.';
            }
            break;
        case 'postalCode':
        case 'sepaPostalCode':
            if (value && !/^\d{5}$/.test(value)) {
                return 'Please enter a 5-digit postal code.';
            }
            break;
        case 'iban':
            const sanitizedIban = value.replace(/\s/g, '');
            if (value && !/^DE\d{20}$/.test(sanitizedIban)) {
                return 'Please enter a valid 22-character German IBAN.';
            }
            break;
        default:
            break;
    }
    return '';
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof IFormData; value: string };
    
    let formattedValue = value;
    if (name === 'iban') {
        formattedValue = value.replace(/[^\dA-Z]/gi, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 27);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));

    if (errors[name]) {
        const error = validateField(name, formattedValue);
        setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const isCanvasBlank = useCallback((): boolean => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return true;
    const context = canvas.getContext('2d');
    if(!context) return true;
    const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    return !pixelBuffer.some(color => color !== 0);
  }, []);

  useEffect(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas || signatureMode !== 'draw') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getPosition = (e: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        e.preventDefault();
        if (e instanceof MouseEvent) {
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return {x: 0, y: 0};
    }

    const startDrawing = (e: MouseEvent | TouchEvent) => {
        isDrawing.current = true;
        const { x, y } = getPosition(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
        if (!isDrawing.current) return;
        const { x, y } = getPosition(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        ctx.closePath();
        setIsSigned(!isCanvasBlank());
    };
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseleave', stopDrawing);
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [signatureMode, isCanvasBlank]);


  useEffect(() => {
    const signatureDrawn = signatureMode === 'draw' && !isCanvasBlank();
    const signatureUploaded = signatureMode === 'upload' && !!uploadedSignature;
    setIsSigned(signatureDrawn || signatureUploaded);
  }, [isCanvasBlank, uploadedSignature, signatureMode]);
  
  const clearSignature = () => {
    if (signatureMode === 'draw') {
        const canvas = signatureCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
    } else {
        setUploadedSignature(null);
    }
    setIsSigned(false);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setUploadedSignature(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please upload a valid image file.");
    }
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof IFormData, string>> = {};
    const fieldsToValidate: Array<keyof IFormData> = [
        'firstName', 'lastName', 'dob', 'gender', 'address', 'postalCode', 'city', 'phone', 'email',
        'sepaGender', 'sepaFirstName', 'sepaLastName', 'sepaAddress', 'sepaPostalCode', 'sepaCity', 'iban'
    ];

    for (const key of fieldsToValidate) {
        const error = validateField(key, formData[key]);
        if (error) {
            newErrors[key] = error;
        }
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
        setTimeout(() => {
            const firstErrorField = document.querySelector('.border-red-500, .outline-red-500');
            firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return false;
    }
    return true;
  }, [formData, validateField]);

  const checkFormValidity = useCallback(() => {
    const fieldsToValidate: Array<keyof IFormData> = [
        'firstName', 'lastName', 'dob', 'gender', 'address', 'postalCode', 'city', 'phone', 'email',
        'sepaGender', 'sepaFirstName', 'sepaLastName', 'sepaAddress', 'sepaPostalCode', 'sepaCity', 'iban'
    ];
    for (const key of fieldsToValidate) {
        if (validateField(key, formData[key])) return false;
    }
    return true;
  }, [formData, validateField]);

  useEffect(() => {
    setIsFormCompleteAndValid(checkFormValidity());
  }, [formData, checkFormValidity]);


  const handleSubmitApplication = async () => {
    if (!validateForm()) return;
    
    let signatureDataUrl: string | null = null;
    if (signatureMode === 'draw' && !isCanvasBlank()) {
      signatureDataUrl = signatureCanvasRef.current?.toDataURL('image/png') || null;
    } else if (signatureMode === 'upload' && uploadedSignature) {
      signatureDataUrl = uploadedSignature;
    }

    if (!signatureDataUrl) {
      alert("Please provide a signature before submitting.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Submitting application... This may take a moment.');
    
    try {
        const response = await fetch('/api/submit-form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, signatureDataUrl }),
        });

        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
            throw new Error(responseData.message || 'Failed to save form data.');
        }

        setSubmissionSuccess(true);
        setStatusMessage(responseData.message);

    } catch (error) {
        console.error("Submission Error:", error);
        let errorMessage = 'An unknown error occurred. Please try again.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        alert(`Could not submit your application.\n\nError: ${errorMessage}`);
        setStatusMessage('');
    } finally {
        setIsProcessing(false);
    }
  };
  
  const resetForm = () => {
      setFormData(initialFormData);
      setErrors({});
      clearSignature();
      setSubmissionSuccess(false);
      setStatusMessage('');
  };

  if (submissionSuccess) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
                 <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h2 className="text-2xl font-bold text-gray-800 mt-4">Thank You!</h2>
                <p className="text-gray-600 mt-2">{statusMessage}</p>
                <p className="text-gray-600 mt-1">A completed copy of your application has been sent to your email address for your records.</p>
                <button
                    onClick={resetForm}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700"
                >
                    Submit Another Application
                </button>
            </div>
        </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto text-sm">
          <div id="pdf-content-area">
            <div id="form-to-print" className="bg-white p-4 sm:p-5 rounded-lg shadow-md">
              <header className="flex flex-col sm:flex-row justify-between items-center pb-2 border-b-2 border-gray-200">
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Hamburg Kannada Freunde e.V</h1>
                  <p className="text-md text-blue-600 font-semibold">EINTRITTSFORMULAR / Membership Form</p>
                </div>
                <img src={logoHKF} alt="Logo" className="w-20 h-20 rounded-full object-cover mt-4 sm:mt-0" />
              </header>

              <main className="pt-3 space-y-3">
                {/* Personal Details Section */}
                <section className="space-y-1.5 p-3 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-1.5">Personal Details (Bitte in Druckbuchstaben ausfüllen)</h3>
                    <FormField label="First Name (Vorname)" name="firstName" value={formData.firstName} onChange={handleInputChange} error={errors.firstName} required />
                    <FormField label="Last Name (Nachname)" name="lastName" value={formData.lastName} onChange={handleInputChange} error={errors.lastName} required />
                    <FormField label="Date of Birth (Geburtsdatum)" name="dob" type="date" value={formData.dob} onChange={handleInputChange} error={errors.dob} required />
                    <RadioGroup label="Gender (Geschlecht)" name="gender" selectedValue={formData.gender} onChange={handleInputChange} options={[{value: 'male', label: 'Männlich (Male)'}, {value: 'female', label: 'Weiblich (Female)'}]} error={errors.gender} required />
                    <FormField label="Address (Adresse)" name="address" value={formData.address} onChange={handleInputChange} error={errors.address} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1.5">
                      <FormField label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleInputChange} error={errors.postalCode} required />
                      <FormField label="City (Ort)" name="city" value={formData.city} onChange={handleInputChange} error={errors.city} required />
                    </div>
                    <FormField label="Phone (Tel./Handy)" name="phone" value={formData.phone} onChange={handleInputChange} type="tel" error={errors.phone} required />
                    <FormField label="E-Mail" name="email" value={formData.email} onChange={handleInputChange} type="email" error={errors.email} required />
                </section>

                 {/* SEPA Mandate Section */}
                <section className="space-y-2 p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
                    <h3 className="text-xl font-bold text-center text-gray-800">SEPA-Lastschriftmandat (SEPA Direct Debit Mandate)</h3>
                    <p className="text-xs text-gray-600">Hiermit ermächtige ich den Hamburg Kannada Freunde e.V., den Mitgliedsbeitrag von meinem unten angegebenen Konto per Lastschrift einzuziehen. / I hereby authorize Hamburg Kannada Freunde e.V. to collect the membership fee from my account specified below via direct debit.</p>
                    <div className="space-y-1.5">
                        <RadioGroup label="Gender" name="sepaGender" selectedValue={formData.sepaGender} onChange={handleInputChange} options={[{value: 'male', label: 'Male'}, {value: 'female', 'label': 'Female'}, {value: 'diverse', label: 'Diverse'}, {value: 'none', label: 'No Answer'}, {value: 'institution', label: 'Institution'}]} error={errors.sepaGender} required />
                        <FormField label="First Name (Vorname)" name="sepaFirstName" value={formData.sepaFirstName} onChange={handleInputChange} error={errors.sepaFirstName} required />
                        <FormField label="Last Name (Nachname)" name="sepaLastName" value={formData.sepaLastName} onChange={handleInputChange} error={errors.sepaLastName} required />
                        <FormField label="Address (Adresse)" name="sepaAddress" value={formData.sepaAddress} onChange={handleInputChange} error={errors.sepaAddress} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1.5">
                            <FormField label="Postal Code" name="sepaPostalCode" value={formData.sepaPostalCode} onChange={handleInputChange} error={errors.sepaPostalCode} required />
                            <FormField label="City (Ort)" name="sepaCity" value={formData.sepaCity} onChange={handleInputChange} error={errors.sepaCity} required />
                        </div>
                        <FormField label="IBAN" name="iban" value={formData.iban} onChange={handleInputChange} placeholder="DE00 0000 0000 0000 0000 00" error={errors.iban} required />
                    </div>
                </section>
                
                {/* Signature Section */}
                <section className="space-y-1 p-3 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-1.5">Signature (Unterschrift)<span className="text-red-500 ml-1">*</span></h3>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:gap-1">
                        <div className="w-full sm:w-1/2 flex-1 flex flex-col">
                            <label className="font-semibold text-gray-700 mb-2">Entry Date (Eintrittsdatum):</label>
                             <div className="p-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-800 w-1/2">
                                {formData.entryDate}
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2 flex-1">
                            <div className="flex border-b">
                                <button onClick={() => setSignatureMode('draw')} className={`px-4 py-2 text-sm font-semibold w-1/2 rounded-t-lg ${signatureMode === 'draw' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Draw Signature</button>
                                <button onClick={() => setSignatureMode('upload')} className={`px-4 py-2 text-sm font-semibold w-1/2 rounded-t-lg ${signatureMode === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Upload Signature</button>
                            </div>

                            {signatureMode === 'draw' && (
                                <div className="mt-2">
                                    <canvas ref={signatureCanvasRef} width="400" height="80" className="border border-gray-400 rounded-md bg-gray-50 cursor-crosshair w-full"></canvas>
                                </div>
                            )}

                            {signatureMode === 'upload' && (
                                <div className="mt-2 p-4 border border-dashed rounded-md text-center">
                                    <input type="file" id="signature-upload" className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                                    <label htmlFor="signature-upload" className="cursor-pointer text-blue-600 hover:underline">Choose an image file</label>
                                    {uploadedSignature && <img src={uploadedSignature} alt="Uploaded Signature" className="mt-2 max-w-full h-auto mx-auto max-h-20 object-contain" />}
                                </div>
                            )}
                            <button type="button" onClick={clearSignature} className="mt-1 text-xs text-blue-600 hover:underline">Clear Signature</button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Signature should be from the SEPA mandate owner.</p>
                </section>
              </main>
            </div>
            
            <div id="terms-and-conditions-container">
                <TermsAndConditions />
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                  onClick={handleSubmitApplication}
                  disabled={isProcessing || !isSigned || !isFormCompleteAndValid}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                  {isProcessing ? (
                      <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {statusMessage || 'Processing...'}
                      </>
                  ) : (
                      'Submit Application'
                  )}
              </button>
              {!isProcessing && (!isFormCompleteAndValid || !isSigned) && (
                  <p className="text-red-500 text-sm font-semibold">
                      {!isFormCompleteAndValid
                          ? "Please complete all required fields to enable."
                          : "A signature is required to enable."
                      }
                  </p>
              )}
          </div>
          
        <footer className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-700">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">Contact</h4>
                    <address className="not-italic mt-2 space-y-1 text-gray-600">
                        <div className="font-medium text-gray-700">Hamburg Kannada Freunde e.V.</div>
                        <div>Emmi-Ruben-Weg 17B, 21147 Hamburg</div>
                        <div>
                            Email:{" "}
                            <a
                                href="mailto:contact@hamburgkannadamitraru.com"
                                className="text-blue-600 hover:underline"
                            >
                                contact@hamburgkannadamitraru.com
                            </a>
                        </div>
                        <div>
                            Website:{" "}
                            <a
                                href="https://www.hamburgkannadamitraru.com"
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                www.hamburgkannadamitraru.com
                            </a>
                        </div>
                    </address>
                </div>

                <div className="flex-2 min-w-0">
                    <h4 className="font-semibold text-gray-800">Bank Details</h4>
                    <div className="mt-2 space-y-1 text-gray-600">
                        <div className="font-medium text-gray-700">Hamburger Sparkasse (HASPA)</div>
                        <div>
                            IBAN: <span className="font-mono bg-gray-50 px-2 py-0.5 rounded text-sm">DE73 2005 0550 1506 4113 37</span>
                        </div>
                        <div>
                            BIC: <span className="font-mono bg-gray-50 px-2 py-0.5 rounded text-sm">HASPDEHHXXX</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto mt-4 text-center text-xs text-gray-400">
                © {new Date().getFullYear()} Hamburg Kannada Freunde e.V.
            </div>
        </footer>

        </div>
      </div>
    </>
  );
};

export default App;