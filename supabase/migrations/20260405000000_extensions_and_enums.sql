-- Migration: Extensions and Enums
-- Timestamp: 20260405000000

-- 1. EXTENSIONS
create extension if not exists "postgis"; -- For location-based queries

-- 2. ENUMS
create type user_role as enum ('customer', 'driver', 'admin');
create type verification_status as enum ('pending', 'approved', 'rejected');
create type trip_status as enum ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'expired', 'failed');
create type payment_method as enum ('bank_transfer', 'ewallet', 'qris');
create type vehicle_status as enum ('active', 'maintenance', 'inactive');
create type driver_status as enum ('online', 'offline', 'active', 'inactive');
create type ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type ticket_category as enum ('payment', 'driver_report', 'route', 'app_issue', 'other');
create type ticket_priority as enum ('low', 'medium', 'high', 'critical');
