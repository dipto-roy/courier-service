# 🎨 Frontend Developer Integration Guide

> **Complete guide for integrating the Courier Service API into your frontend application**

---

## 📑 Table of Contents

- [Quick Start](#-quick-start)
- [Authentication Flow](#-authentication-flow)
- [API Base Configuration](#-api-base-configuration)
- [Common Integration Patterns](#-common-integration-patterns)
- [Feature Implementation Guides](#-feature-implementation-guides)
- [State Management Examples](#-state-management-examples)
- [Error Handling](#-error-handling)
- [Real-time Features](#-real-time-features)
- [UI Components Examples](#-ui-components-examples)
- [Best Practices](#-best-practices)

---

## 🚀 Quick Start

### Prerequisites

- API Base URL: `http://localhost:3001/api` (development)
- API Documentation: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Authentication: JWT Bearer tokens

### Essential API Endpoints

| Module | Base Path | Purpose |
|--------|-----------|---------|
| Authentication | `/auth` | User signup, login, OTP verification |
| Shipments | `/shipments` | Create, track, manage shipments |
| Rider Operations | `/rider` | GPS tracking, delivery operations |

---

## 🔐 Authentication Flow

### 1. User Registration (Merchant or Rider)

```typescript
// Type definitions
interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'merchant' | 'rider' | 'customer';
  city: string;
  area: string;
  address: string;
  merchantBusinessName?: string; // Required if role is 'merchant'
}

interface SignupResponse {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    isVerified: boolean;
  };
  message: string;
}

// API Call
async function signup(data: SignupRequest): Promise<SignupResponse> {
  const response = await fetch('http://localhost:3001/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }

  return response.json();
}

// Usage Example
const merchantData = {
  name: "John's Store",
  email: "john@store.com",
  phone: "+8801712345678",
  password: "SecurePass123!",
  role: "merchant",
  city: "Dhaka",
  area: "Gulshan",
  address: "House 10, Road 12, Gulshan-1",
  merchantBusinessName: "John's Electronics",
};

try {
  const result = await signup(merchantData);
  console.log('User registered:', result.user);
  // Show OTP verification form
} catch (error) {
  console.error('Signup error:', error.message);
}
```

### 2. OTP Verification

```typescript
interface VerifyOTPRequest {
  email: string;
  otp: string; // 6-digit code
}

interface VerifyOTPResponse {
  message: string;
  user: {
    id: number;
    email: string;
    isVerified: boolean;
  };
}

async function verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
  const response = await fetch('http://localhost:3001/api/auth/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'OTP verification failed');
  }

  return response.json();
}

// Usage
try {
  const result = await verifyOTP({
    email: "john@store.com",
    otp: "123456",
  });
  console.log('Account verified:', result.message);
  // Redirect to login
} catch (error) {
  console.error('OTP verification error:', error.message);
}
```

### 3. Login

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    phone: string;
    city: string;
  };
}

async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

// Usage with localStorage
try {
  const result = await login({
    email: "john@store.com",
    password: "SecurePass123!",
  });
  
  // Store tokens securely
  localStorage.setItem('access_token', result.access_token);
  localStorage.setItem('refresh_token', result.refresh_token);
  localStorage.setItem('user', JSON.stringify(result.user));
  
  // Redirect based on role
  if (result.user.role === 'merchant') {
    window.location.href = '/merchant/dashboard';
  } else if (result.user.role === 'rider') {
    window.location.href = '/rider/dashboard';
  }
} catch (error) {
  console.error('Login error:', error.message);
}
```

### 4. Token Refresh

```typescript
interface RefreshTokenRequest {
  refresh_token: string;
}

interface RefreshTokenResponse {
  access_token: string;
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch('http://localhost:3001/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    // Refresh token expired, force re-login
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const result: RefreshTokenResponse = await response.json();
  localStorage.setItem('access_token', result.access_token);
  
  return result.access_token;
}
```

---

## ⚙️ API Base Configuration

### Axios Instance Setup

```typescript
import axios, { AxiosError, AxiosResponse } from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Fetch API Wrapper

```typescript
class APIClient {
  private baseURL = 'http://localhost:3001/api';
  
  private async getHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  private async handleError(response: Response): Promise<never> {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }
}

export const apiClient = new APIClient();
```

---

## 🎯 Common Integration Patterns

### Protected Route Component (React)

```typescript
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Usage
<Route
  path="/merchant/dashboard"
  element={
    <ProtectedRoute requiredRole="merchant">
      <MerchantDashboard />
    </ProtectedRoute>
  }
/>
```

### Custom Auth Hook

```typescript
import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  phone: string;
  city: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      const user = JSON.parse(userStr);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    const result = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    localStorage.setItem('access_token', result.access_token);
    localStorage.setItem('refresh_token', result.refresh_token);
    localStorage.setItem('user', JSON.stringify(result.user));

    setAuthState({
      user: result.user,
      isAuthenticated: true,
      isLoading: false,
    });

    return result;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      window.location.href = '/login';
    }
  };

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}
```

---

## 📦 Feature Implementation Guides

### 1. Create Shipment (Merchant)

```typescript
interface Address {
  name: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

interface CreateShipmentRequest {
  senderAddress: Address;
  receiverAddress: Address;
  deliveryType: 'regular' | 'express' | 'same_day';
  paymentMethod: 'cod' | 'prepaid';
  codAmount?: number; // Required if paymentMethod is 'cod'
  weight: number; // In kg, must be between 0.1 and 50
  packageDescription?: string;
  specialInstructions?: string;
}

interface CreateShipmentResponse {
  id: number;
  awbNumber: string; // Tracking number
  status: string;
  senderAddress: Address;
  receiverAddress: Address;
  estimatedDeliveryDate: string;
  createdAt: string;
}

async function createShipment(
  data: CreateShipmentRequest
): Promise<CreateShipmentResponse> {
  return apiClient.post('/shipments', data);
}

// Example Usage in React Component
function CreateShipmentForm() {
  const [formData, setFormData] = useState<CreateShipmentRequest>({
    senderAddress: {
      name: '',
      phone: '',
      address: '',
      city: 'Dhaka',
      area: '',
    },
    receiverAddress: {
      name: '',
      phone: '',
      address: '',
      city: '',
      area: '',
    },
    deliveryType: 'regular',
    paymentMethod: 'cod',
    weight: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createShipment(formData);
      
      alert(`Shipment created! AWB: ${result.awbNumber}`);
      
      // Redirect to shipment details
      window.location.href = `/shipments/${result.id}`;
    } catch (error) {
      console.error('Error creating shipment:', error);
      alert('Failed to create shipment');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Shipment</h2>
      
      {/* Sender Details */}
      <fieldset>
        <legend>Sender Information</legend>
        <input
          type="text"
          placeholder="Sender Name"
          value={formData.senderAddress.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              senderAddress: {
                ...formData.senderAddress,
                name: e.target.value,
              },
            })
          }
          required
        />
        <input
          type="tel"
          placeholder="Sender Phone"
          value={formData.senderAddress.phone}
          onChange={(e) =>
            setFormData({
              ...formData,
              senderAddress: {
                ...formData.senderAddress,
                phone: e.target.value,
              },
            })
          }
          required
        />
        {/* Add more sender fields */}
      </fieldset>

      {/* Receiver Details */}
      <fieldset>
        <legend>Receiver Information</legend>
        {/* Similar inputs for receiver */}
      </fieldset>

      {/* Shipment Details */}
      <fieldset>
        <legend>Shipment Details</legend>
        <select
          value={formData.deliveryType}
          onChange={(e) =>
            setFormData({
              ...formData,
              deliveryType: e.target.value as any,
            })
          }
        >
          <option value="regular">Regular (3-5 days)</option>
          <option value="express">Express (1-2 days)</option>
          <option value="same_day">Same Day</option>
        </select>

        <select
          value={formData.paymentMethod}
          onChange={(e) =>
            setFormData({
              ...formData,
              paymentMethod: e.target.value as any,
            })
          }
        >
          <option value="cod">Cash on Delivery</option>
          <option value="prepaid">Prepaid</option>
        </select>

        {formData.paymentMethod === 'cod' && (
          <input
            type="number"
            placeholder="COD Amount"
            value={formData.codAmount || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                codAmount: parseFloat(e.target.value),
              })
            }
            required
          />
        )}

        <input
          type="number"
          step="0.1"
          min="0.1"
          max="50"
          placeholder="Weight (kg)"
          value={formData.weight}
          onChange={(e) =>
            setFormData({
              ...formData,
              weight: parseFloat(e.target.value),
            })
          }
          required
        />
      </fieldset>

      <button type="submit">Create Shipment</button>
    </form>
  );
}
```

### 2. Track Shipment (Public)

```typescript
interface TrackingResponse {
  id: number;
  awbNumber: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'rto';
  currentLocation?: string;
  estimatedDeliveryDate: string;
  history: {
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }[];
  receiverAddress: {
    name: string;
    city: string;
    area: string;
  };
}

async function trackShipment(awbNumber: string): Promise<TrackingResponse> {
  // Public endpoint - no auth required
  const response = await fetch(
    `http://localhost:3001/api/shipments/track/${awbNumber}`
  );

  if (!response.ok) {
    throw new Error('Shipment not found');
  }

  return response.json();
}

// React Component
function TrackingPage() {
  const [awbNumber, setAwbNumber] = useState('');
  const [tracking, setTracking] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTracking(null);

    try {
      const result = await trackShipment(awbNumber);
      setTracking(result);
    } catch (err: any) {
      setError(err.message || 'Failed to track shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tracking-page">
      <h1>Track Your Shipment</h1>
      
      <form onSubmit={handleTrack}>
        <input
          type="text"
          placeholder="Enter AWB Number (e.g., AWB1730000000001)"
          value={awbNumber}
          onChange={(e) => setAwbNumber(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Tracking...' : 'Track'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {tracking && (
        <div className="tracking-result">
          <h2>Shipment Details</h2>
          <div className="shipment-info">
            <p><strong>AWB:</strong> {tracking.awbNumber}</p>
            <p><strong>Status:</strong> {tracking.status}</p>
            <p><strong>Receiver:</strong> {tracking.receiverAddress.name}</p>
            <p><strong>Destination:</strong> {tracking.receiverAddress.area}, {tracking.receiverAddress.city}</p>
            {tracking.currentLocation && (
              <p><strong>Current Location:</strong> {tracking.currentLocation}</p>
            )}
            <p><strong>Estimated Delivery:</strong> {new Date(tracking.estimatedDeliveryDate).toLocaleDateString()}</p>
          </div>

          <h3>Tracking History</h3>
          <div className="timeline">
            {tracking.history.map((event, index) => (
              <div key={index} className="timeline-event">
                <div className="timeline-date">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
                <div className="timeline-content">
                  <h4>{event.status}</h4>
                  <p>{event.description}</p>
                  {event.location && <p><em>{event.location}</em></p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3. Rider GPS Tracking

```typescript
interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
}

async function updateRiderLocation(
  location: LocationUpdate
): Promise<{ message: string }> {
  return apiClient.post('/rider/location', location);
}

// React Hook for GPS Tracking
function useGPSTracking(interval: number = 30000) {
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number;
    let intervalId: NodeJS.Timeout;

    if (isTracking) {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        return;
      }

      // Watch position
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            await updateRiderLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed || undefined,
              heading: position.coords.heading || undefined,
            });

            setLastUpdate(new Date());
            setError(null);
          } catch (err: any) {
            setError(err.message);
          }
        },
        (err) => {
          setError(err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      // Send updates at regular intervals
      intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              await updateRiderLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              });
              setLastUpdate(new Date());
            } catch (err: any) {
              setError(err.message);
            }
          },
          (err) => setError(err.message)
        );
      }, interval);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTracking, interval]);

  return {
    isTracking,
    startTracking: () => setIsTracking(true),
    stopTracking: () => setIsTracking(false),
    lastUpdate,
    error,
  };
}

// Component Usage
function RiderDashboard() {
  const { isTracking, startTracking, stopTracking, lastUpdate, error } = useGPSTracking(30000);

  return (
    <div>
      <h1>Rider Dashboard</h1>
      
      <div className="gps-status">
        <h2>GPS Tracking</h2>
        <p>Status: {isTracking ? '🟢 Active' : '🔴 Inactive'}</p>
        {lastUpdate && (
          <p>Last Update: {lastUpdate.toLocaleTimeString()}</p>
        )}
        {error && <p className="error">Error: {error}</p>}
        
        <button onClick={isTracking ? stopTracking : startTracking}>
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </button>
      </div>
    </div>
  );
}
```

### 4. Complete Delivery with OTP

```typescript
interface GenerateOTPRequest {
  awbNumber: string;
}

interface GenerateOTPResponse {
  message: string;
  otp: string; // 6-digit code
}

async function generateDeliveryOTP(
  awbNumber: string
): Promise<GenerateOTPResponse> {
  return apiClient.post('/rider/generate-otp', { awbNumber });
}

interface CompleteDeliveryRequest {
  awbNumber: string;
  otpCode: string;
  signatureUrl?: string;
  podPhotoUrl?: string;
  codAmountCollected?: number;
  deliveryNotes?: string;
}

async function completeDelivery(
  data: CompleteDeliveryRequest
): Promise<{ message: string; shipment: any }> {
  return apiClient.post('/rider/complete-delivery', data);
}

// React Component
function DeliveryCompletionForm({ awbNumber }: { awbNumber: string }) {
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [codAmount, setCodAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateOTP = async () => {
    try {
      const result = await generateDeliveryOTP(awbNumber);
      setGeneratedOTP(result.otp);
      alert(`OTP Generated: ${result.otp}\n(In production, this would be sent to customer)`);
    } catch (error: any) {
      alert('Failed to generate OTP: ' + error.message);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await completeDelivery({
        awbNumber,
        otpCode: otp,
        codAmountCollected: codAmount ? parseFloat(codAmount) : undefined,
        deliveryNotes: notes || undefined,
      });

      alert('Delivery completed successfully!');
      window.location.href = '/rider/shipments';
    } catch (error: any) {
      alert('Failed to complete delivery: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-form">
      <h2>Complete Delivery</h2>
      <p><strong>AWB:</strong> {awbNumber}</p>

      <button onClick={handleGenerateOTP}>Generate OTP for Customer</button>
      
      {generatedOTP && (
        <p className="otp-display">Generated OTP: {generatedOTP}</p>
      )}

      <form onSubmit={handleComplete}>
        <div>
          <label>Enter OTP from Customer:</label>
          <input
            type="text"
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>

        <div>
          <label>COD Amount Collected (if applicable):</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={codAmount}
            onChange={(e) => setCodAmount(e.target.value)}
          />
        </div>

        <div>
          <label>Delivery Notes:</label>
          <textarea
            placeholder="Any additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Complete Delivery'}
        </button>
      </form>
    </div>
  );
}
```

### 5. Bulk Shipment Upload

```typescript
interface BulkUploadResponse {
  totalShipments: number;
  successCount: number;
  failedCount: number;
  errors: {
    row: number;
    error: string;
  }[];
  shipments: {
    id: number;
    awbNumber: string;
  }[];
}

async function bulkUploadShipments(file: File): Promise<BulkUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:3001/api/shipments/bulk-upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Bulk upload failed');
  }

  return response.json();
}

// CSV Template Generator
function generateCSVTemplate(): string {
  const headers = [
    'sender_name',
    'sender_phone',
    'sender_address',
    'sender_city',
    'sender_area',
    'receiver_name',
    'receiver_phone',
    'receiver_address',
    'receiver_city',
    'receiver_area',
    'receiver_latitude',
    'receiver_longitude',
    'delivery_type',
    'payment_method',
    'cod_amount',
    'weight',
    'package_description',
  ];

  const sampleData = [
    'John Doe',
    '+8801712345678',
    'House 10, Road 12',
    'Dhaka',
    'Gulshan',
    'Jane Smith',
    '+8801798765432',
    'Flat 5B, Building 3',
    'Dhaka',
    'Dhanmondi',
    '23.7449160',
    '90.3575580',
    'regular',
    'cod',
    '1500',
    '2.5',
    'Electronics - Handle with care',
  ];

  return [headers.join(','), sampleData.join(',')].join('\n');
}

// React Component
function BulkUploadComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkUploadResponse | null>(null);

  const downloadTemplate = () => {
    const csv = generateCSVTemplate();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipments_template.csv';
    a.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const response = await bulkUploadShipments(file);
      setResult(response);
      
      if (response.failedCount === 0) {
        alert(`Success! ${response.successCount} shipments created.`);
      } else {
        alert(
          `Upload completed with errors:\n` +
          `Success: ${response.successCount}\n` +
          `Failed: ${response.failedCount}`
        );
      }
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bulk-upload">
      <h2>Bulk Shipment Upload</h2>
      
      <button onClick={downloadTemplate}>
        📥 Download CSV Template
      </button>

      <div className="upload-section">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
        
        {file && (
          <div>
            <p>Selected file: {file.name}</p>
            <button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="upload-result">
          <h3>Upload Results</h3>
          <p>Total: {result.totalShipments}</p>
          <p className="success">✅ Success: {result.successCount}</p>
          <p className="failed">❌ Failed: {result.failedCount}</p>

          {result.errors.length > 0 && (
            <div className="errors">
              <h4>Errors:</h4>
              <ul>
                {result.errors.map((err, index) => (
                  <li key={index}>
                    Row {err.row}: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.shipments.length > 0 && (
            <div className="created-shipments">
              <h4>Created Shipments:</h4>
              <ul>
                {result.shipments.map((shipment) => (
                  <li key={shipment.id}>
                    {shipment.awbNumber} (ID: {shipment.id})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 State Management Examples

### Redux Toolkit (Recommended)

```typescript
// features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/auth/logout', {});
      
      localStorage.clear();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    checkAuth: (state) => {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        state.user = JSON.parse(userStr);
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { checkAuth } = authSlice.actions;
export default authSlice.reducer;
```

```typescript
// features/shipments/shipmentsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../services/api';

interface Shipment {
  id: number;
  awbNumber: string;
  status: string;
  // ... other fields
}

interface ShipmentsState {
  shipments: Shipment[];
  currentShipment: Shipment | null;
  loading: boolean;
  error: string | null;
}

const initialState: ShipmentsState = {
  shipments: [],
  currentShipment: null,
  loading: false,
  error: null,
};

export const fetchShipments = createAsyncThunk(
  'shipments/fetchAll',
  async () => {
    const response = await apiClient.get('/shipments');
    return response.data;
  }
);

export const createShipment = createAsyncThunk(
  'shipments/create',
  async (data: any) => {
    const response = await apiClient.post('/shipments', data);
    return response;
  }
);

const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShipments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.loading = false;
        state.shipments = action.payload;
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch shipments';
      });
  },
});

export default shipmentsSlice.reducer;
```

### React Context (Simpler Alternative)

```typescript
// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    setUser(response.user);
  };

  const logout = async () => {
    await apiClient.post('/auth/logout', {});
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## ⚠️ Error Handling

### Centralized Error Handler

```typescript
interface APIError {
  statusCode: number;
  message: string;
  error?: string;
}

export class APIErrorHandler {
  static handle(error: any): never {
    if (error.response) {
      // Server responded with error
      const apiError: APIError = error.response.data;
      
      switch (apiError.statusCode) {
        case 400:
          throw new Error(apiError.message || 'Invalid request');
        case 401:
          localStorage.clear();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        case 403:
          throw new Error('You do not have permission to perform this action');
        case 404:
          throw new Error('Resource not found');
        case 409:
          throw new Error(apiError.message || 'Conflict error');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(apiError.message || 'An error occurred');
      }
    } else if (error.request) {
      // No response received
      throw new Error('Network error. Please check your connection.');
    } else {
      // Other errors
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

// Usage
try {
  await createShipment(data);
} catch (error) {
  const message = APIErrorHandler.handle(error);
  // Show error to user
  toast.error(message);
}
```

### React Error Boundary

```typescript
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to error tracking service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-page">
            <h1>Something went wrong</h1>
            <p>{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 📡 Real-time Features

### WebSocket Integration (If Implemented)

```typescript
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(userId: number) {
    const token = localStorage.getItem('access_token');
    this.ws = new WebSocket(`ws://localhost:3001?token=${token}&userId=${userId}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect(userId);
    };
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'SHIPMENT_STATUS_UPDATE':
        // Dispatch Redux action or update state
        console.log('Shipment status updated:', data.payload);
        break;
      case 'NEW_SHIPMENT_ASSIGNED':
        // Notify rider
        console.log('New shipment assigned:', data.payload);
        break;
      case 'RIDER_LOCATION_UPDATE':
        // Update map
        console.log('Rider location updated:', data.payload);
        break;
    }
  }

  private reconnect(userId: number) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.connect(userId);
      }, 3000);
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    this.ws?.close();
  }
}

export const wsService = new WebSocketService();
```

### Polling Alternative

```typescript
// Use polling if WebSocket is not available
function useShipmentPolling(shipmentId: number, interval: number = 10000) {
  const [shipment, setShipment] = useState<any>(null);

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const data = await apiClient.get(`/shipments/${shipmentId}`);
        setShipment(data);
      } catch (error) {
        console.error('Error fetching shipment:', error);
      }
    };

    fetchShipment(); // Initial fetch

    const intervalId = setInterval(fetchShipment, interval);

    return () => clearInterval(intervalId);
  }, [shipmentId, interval]);

  return shipment;
}
```

---

## 🎨 UI Components Examples

### Shipment Status Badge

```typescript
interface StatusBadgeProps {
  status: string;
}

function ShipmentStatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'gray',
      picked_up: 'blue',
      in_transit: 'purple',
      out_for_delivery: 'orange',
      delivered: 'green',
      failed: 'red',
      rto: 'yellow',
    };
    return colors[status] || 'gray';
  };

  const getStatusIcon = (status: string): string => {
    const icons: Record<string, string> = {
      pending: '⏳',
      picked_up: '📦',
      in_transit: '🚚',
      out_for_delivery: '🏃',
      delivered: '✅',
      failed: '❌',
      rto: '↩️',
    };
    return icons[status] || '📋';
  };

  return (
    <span
      className={`status-badge status-${status}`}
      style={{
        backgroundColor: getStatusColor(status),
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
      }}
    >
      {getStatusIcon(status)} {status.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
}
```

### Map Component (Leaflet)

```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  label?: string;
}

function LocationMap({ latitude, longitude, label }: LocationMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={[latitude, longitude]}>
        {label && <Popup>{label}</Popup>}
      </Marker>
    </MapContainer>
  );
}

// Usage
<LocationMap
  latitude={23.7808875}
  longitude={90.4161712}
  label="Delivery Location"
/>
```

### Shipments List Component

```typescript
interface Shipment {
  id: number;
  awbNumber: string;
  status: string;
  receiverAddress: {
    name: string;
    city: string;
    area: string;
  };
  createdAt: string;
  estimatedDeliveryDate: string;
}

function ShipmentsList() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    fetchShipments();
  }, [filter]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const query = filter ? `?status=${filter}` : '';
      const data = await apiClient.get(`/shipments${query}`);
      setShipments(data.data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading shipments...</div>;

  return (
    <div className="shipments-list">
      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Shipments</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>AWB Number</th>
            <th>Receiver</th>
            <th>Location</th>
            <th>Status</th>
            <th>Created</th>
            <th>Est. Delivery</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((shipment) => (
            <tr key={shipment.id}>
              <td>{shipment.awbNumber}</td>
              <td>{shipment.receiverAddress.name}</td>
              <td>
                {shipment.receiverAddress.area}, {shipment.receiverAddress.city}
              </td>
              <td>
                <ShipmentStatusBadge status={shipment.status} />
              </td>
              <td>{new Date(shipment.createdAt).toLocaleDateString()}</td>
              <td>
                {new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}
              </td>
              <td>
                <button onClick={() => window.location.href = `/shipments/${shipment.id}`}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## ✅ Best Practices

### 1. Security

```typescript
// ✅ DO: Store tokens securely
localStorage.setItem('access_token', token);

// ❌ DON'T: Expose tokens in URLs or logs
console.log('Token:', token); // Never do this

// ✅ DO: Clear sensitive data on logout
const logout = () => {
  localStorage.clear();
  // Clear any other sensitive state
};

// ✅ DO: Validate user input
const isValidPhone = (phone: string) => /^\+880\d{10}$/.test(phone);
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ✅ DO: Implement CSRF protection for forms
// Use CSRF tokens if your backend implements them
```

### 2. Performance

```typescript
// ✅ DO: Debounce search inputs
import { debounce } from 'lodash';

const searchShipments = debounce(async (query: string) => {
  const results = await apiClient.get(`/shipments?search=${query}`);
  setSearchResults(results.data);
}, 500);

// ✅ DO: Implement pagination
interface PaginationParams {
  page: number;
  limit: number;
}

const fetchShipments = async ({ page, limit }: PaginationParams) => {
  return apiClient.get(`/shipments?page=${page}&limit=${limit}`);
};

// ✅ DO: Cache static data
const getCities = async () => {
  const cached = sessionStorage.getItem('cities');
  if (cached) return JSON.parse(cached);

  const cities = await apiClient.get('/cities');
  sessionStorage.setItem('cities', JSON.stringify(cities));
  return cities;
};
```

### 3. User Experience

```typescript
// ✅ DO: Show loading states
function CreateShipmentButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button disabled={loading}>
      {loading ? (
        <>
          <Spinner /> Creating...
        </>
      ) : (
        'Create Shipment'
      )}
    </button>
  );
}

// ✅ DO: Provide user feedback
import { toast } from 'react-toastify';

const createShipment = async (data: any) => {
  try {
    const result = await apiClient.post('/shipments', data);
    toast.success(`Shipment created! AWB: ${result.awbNumber}`);
    return result;
  } catch (error: any) {
    toast.error(error.message || 'Failed to create shipment');
    throw error;
  }
};

// ✅ DO: Handle offline scenarios
window.addEventListener('online', () => {
  toast.info('Connection restored');
  // Retry failed requests
});

window.addEventListener('offline', () => {
  toast.warning('You are offline. Some features may not work.');
});
```

### 4. Testing

```typescript
// Example test for API client
import { apiClient } from './api';

describe('API Client', () => {
  it('should add auth token to requests', async () => {
    localStorage.setItem('access_token', 'test-token');
    
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
    );
    
    global.fetch = mockFetch as any;
    
    await apiClient.get('/shipments');
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });
});
```

---

## 📚 Additional Resources

- **Full API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Backend Repository**: [github.com/dipto-roy/courier-service](https://github.com/dipto-roy/courier-service)
- **Swagger UI**: http://localhost:3001/api/docs (when backend is running)

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| API Base URL (Dev) | `http://localhost:3001/api` |
| Swagger Docs | `http://localhost:3001/api/docs` |
| Health Check | `http://localhost:3001/health` |

---

## 📞 Support

If you encounter any issues during integration:

1. Check the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint specifications
2. Verify your authentication tokens are valid
3. Check the browser console for error messages
4. Review the network tab to see exact API responses
5. Open an issue on GitHub with details of the problem

---

**Last Updated**: November 1, 2025  
**API Version**: 1.0.0

---

Made with ❤️ for Frontend Developers
