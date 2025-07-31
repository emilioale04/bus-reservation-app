-- =====================================================
-- COOPERBUS - DATOS DE PRUEBA SIMPLIFICADOS
-- Script simple para poblar las tablas con datos básicos
-- =====================================================

-- =====================================================
-- 1. INSERTAR RUTAS
-- =====================================================
INSERT INTO routes (origin, destination, duration_minutes, price) VALUES
('Quito', 'Guayaquil', 480, 15.50),
('Guayaquil', 'Quito', 480, 15.50),
('Quito', 'Cuenca', 300, 12.00),
('Cuenca', 'Quito', 300, 12.00),
('Guayaquil', 'Cuenca', 240, 10.00),
('Cuenca', 'Guayaquil', 240, 10.00),
('Quito', 'Ambato', 120, 8.00),
('Ambato', 'Quito', 120, 8.00);

-- =====================================================
-- 2. INSERTAR AUTOBUSES
-- =====================================================
-- Necesitamos obtener los IDs de las rutas para los buses
INSERT INTO buses (bus_number, route_id, capacity, is_active) 
SELECT 
    'CB-' || r.origin || '-' || r.destination || '-0' || series.num,
    r.id,
    40,
    true
FROM routes r
CROSS JOIN generate_series(1, 4) AS series(num);

-- =====================================================
-- 3. INSERTAR HORARIOS
-- =====================================================
INSERT INTO schedules (route_id, departure_time, days_of_week, is_active)
SELECT 
    r.id,
    time_slot,
    ARRAY[1,2,3,4,5,6,7],
    true
FROM routes r
CROSS JOIN (
    VALUES 
    ('06:00'::time),
    ('10:00'::time),
    ('14:00'::time),
    ('18:00'::time)
) AS times(time_slot);

-- =====================================================
-- 4. INSERTAR VIAJES PARA LOS PRÓXIMOS 15 DÍAS
-- =====================================================
INSERT INTO trips (schedule_id, bus_id, trip_date, available_seats, status)
SELECT 
    s.id,
    b.id,
    date_series.trip_date,
    40,
    'active'
FROM schedules s
JOIN buses b ON s.route_id = b.route_id
CROSS JOIN (
    SELECT generate_series(
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '15 days',
        INTERVAL '1 day'
    )::date AS trip_date
) AS date_series
WHERE b.bus_number LIKE '%-01' -- Solo usar el primer bus de cada ruta
LIMIT 500; -- Limitar para no crear demasiados viajes

-- =====================================================
-- 5. CREAR ASIENTOS PARA TODOS LOS VIAJES
-- =====================================================
INSERT INTO seats (trip_id, seat_number, is_reserved)
SELECT 
    t.id,
    seat_num,
    false
FROM trips t
CROSS JOIN generate_series(1, 40) AS seat_num;

-- =====================================================
-- 6. INSERTAR PASAJEROS DE PRUEBA
-- =====================================================
INSERT INTO passengers (name, email, phone, address) VALUES
('Juan Pérez', 'juan.perez@email.com', '0991234567', 'Quito'),
('María García', 'maria.garcia@email.com', '0987654321', 'Guayaquil'),
('Carlos Ruiz', 'carlos.ruiz@email.com', '0976543210', 'Cuenca'),
('Ana López', 'ana.lopez@email.com', '0965432109', 'Quito'),
('Diego Morales', 'diego.morales@email.com', '0954321098', 'Guayaquil');

-- =====================================================
-- 7. CREAR UNA RESERVA DE EJEMPLO
-- =====================================================
-- Primero crear la reserva
INSERT INTO reservations (
    trip_id, 
    passenger_id, 
    passenger_name, 
    passenger_email, 
    passenger_phone, 
    seat_numbers, 
    total_amount, 
    payment_status, 
    confirmation_code
)
SELECT 
    t.id,
    p.id,
    p.name,
    p.email,
    p.phone,
    ARRAY[1, 2],
    31.00,
    'completed',
    'CB123456'
FROM trips t
JOIN schedules s ON t.schedule_id = s.id
JOIN routes r ON s.route_id = r.id
JOIN passengers p ON p.email = 'juan.perez@email.com'
WHERE r.origin = 'Quito' 
AND r.destination = 'Guayaquil'
AND t.trip_date > CURRENT_DATE
LIMIT 1;

-- Marcar los asientos como reservados
UPDATE seats 
SET is_reserved = true,
    reservation_id = (SELECT id FROM reservations WHERE confirmation_code = 'CB123456')
WHERE trip_id = (
    SELECT t.id 
    FROM trips t
    JOIN schedules s ON t.schedule_id = s.id
    JOIN routes r ON s.route_id = r.id
    WHERE r.origin = 'Quito' 
    AND r.destination = 'Guayaquil'
    AND t.trip_date > CURRENT_DATE
    LIMIT 1
)
AND seat_number IN (1, 2);

-- Actualizar asientos disponibles
UPDATE trips 
SET available_seats = 38
WHERE id = (
    SELECT t.id 
    FROM trips t
    JOIN schedules s ON t.schedule_id = s.id
    JOIN routes r ON s.route_id = r.id
    WHERE r.origin = 'Quito' 
    AND r.destination = 'Guayaquil'
    AND t.trip_date > CURRENT_DATE
    LIMIT 1
);

-- =====================================================
-- 8. VERIFICAR DATOS INSERTADOS
-- =====================================================
SELECT 'routes' as tabla, COUNT(*) as total FROM routes
UNION ALL
SELECT 'buses' as tabla, COUNT(*) as total FROM buses
UNION ALL
SELECT 'schedules' as tabla, COUNT(*) as total FROM schedules
UNION ALL
SELECT 'trips' as tabla, COUNT(*) as total FROM trips
UNION ALL
SELECT 'seats' as tabla, COUNT(*) as total FROM seats
UNION ALL
SELECT 'passengers' as tabla, COUNT(*) as total FROM passengers
UNION ALL
SELECT 'reservations' as tabla, COUNT(*) as total FROM reservations;
