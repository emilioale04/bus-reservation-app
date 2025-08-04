-- =================================================================
-- Script de Inserción de Datos para el Sistema de Reservas de Autobuses
-- Versión simplificada basada en el nuevo ejemplo proporcionado.
-- =================================================================

-- =================================================================
-- 1. INSERTAR RUTAS
-- Rutas requeridas por la aplicación, saliendo desde Quito.
-- =================================================================
INSERT INTO public.routes (origin, destination, duration_minutes, price) VALUES
('Quito', 'Guayaquil', 480, 15.00),
('Quito', 'Tulcán', 300, 7.50),
('Quito', 'Loja', 660, 20.00),
('Quito', 'Lago Agrio', 450, 14.00),
('Quito', 'Esmeraldas', 390, 11.50);

-- =================================================================
-- 2. INSERTAR AUTOBUSES
-- 8 buses para Quito-Guayaquil y 4 para las demás rutas.
-- =================================================================
-- Buses para Quito -> Guayaquil (8 unidades)
INSERT INTO public.buses (bus_number, route_id, capacity, is_active) 
SELECT 
    'QG-' || series.num,
    r.id,
    40,
    true
FROM public.routes r
CROSS JOIN generate_series(101, 108) AS series(num)
WHERE r.destination = 'Guayaquil';

-- Buses para las otras 4 rutas (4 unidades por ruta)
INSERT INTO public.buses (bus_number, route_id, capacity, is_active) 
SELECT 
    'QT-' || series.num, r.id, 40, true FROM public.routes r CROSS JOIN generate_series(201, 204) AS series(num) WHERE r.destination = 'Tulcán'
UNION ALL
SELECT 
    'QL-' || series.num, r.id, 40, true FROM public.routes r CROSS JOIN generate_series(301, 304) AS series(num) WHERE r.destination = 'Loja'
UNION ALL
SELECT 
    'QLA-' || series.num, r.id, 40, true FROM public.routes r CROSS JOIN generate_series(401, 404) AS series(num) WHERE r.destination = 'Lago Agrio'
UNION ALL
SELECT 
    'QE-' || series.num, r.id, 40, true FROM public.routes r CROSS JOIN generate_series(501, 504) AS series(num) WHERE r.destination = 'Esmeraldas';

-- =================================================================
-- 3. INSERTAR HORARIOS (FRECUENCIAS)
-- =================================================================
INSERT INTO public.schedules (route_id, departure_time, days_of_week, is_active)
SELECT 
    r.id,
    time_slot,
    ARRAY[1,2,3,4,5,6,7], -- Todos los días de la semana
    true
FROM public.routes r
CROSS JOIN (
    VALUES 
    ('08:00:00'::time),
    ('12:00:00'::time),
    ('22:00:00'::time)
) AS times(time_slot);

-- =================================================================
-- 4. INSERTAR VIAJES PARA LOS PRÓXIMOS 7 DÍAS
-- =================================================================
INSERT INTO public.trips (schedule_id, bus_id, trip_date, available_seats, status)
SELECT 
    s.id,
    b.id,
    date_series.trip_date,
    b.capacity,
    'active'
FROM public.schedules s
-- Asignar un bus a un horario si la ruta coincide
JOIN public.buses b ON s.route_id = b.route_id
-- Crear viajes para los próximos 7 días
CROSS JOIN (
    SELECT generate_series(
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '7 days',
        INTERVAL '1 day'
    )::date AS trip_date
) AS date_series
-- Para no crear una combinación de CADA bus con CADA horario,
-- asignamos un bus específico a un horario específico de forma rotativa.
WHERE mod(b.id::int, 3) = mod(extract(hour from s.departure_time)::int, 3);

-- =================================================================
-- 5. CREAR ASIENTOS PARA TODOS LOS VIAJES CREADOS
-- =================================================================
INSERT INTO public.seats (trip_id, seat_number, is_reserved)
SELECT 
    t.id,
    seat_num,
    false
FROM public.trips t
CROSS JOIN generate_series(1, 40) AS seat_num;

-- =================================================================
-- 6. INSERTAR PASAJEROS DE PRUEBA
-- =================================================================
INSERT INTO public.passengers (identification, name, email, phone, address) VALUES
('1722334455', 'Carlos Solis', 'carlos.solis@email.com', '0987654321', 'Av. Amazonas 123, Quito'),
('0988776655', 'Ana Paredes', 'ana.paredes@email.com', '0998877665', 'Calle Larga 456, Cuenca');

-- =================================================================
-- 7. CREAR UNA RESERVA DE EJEMPLO
-- =================================================================
-- Primero, se crea la reserva
INSERT INTO public.reservations (
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
    ARRAY[5, 6], -- Asientos a reservar
    (r.price * 2), -- Precio para dos asientos
    'completed',
    'CONF-ABC12'
FROM public.trips t
JOIN public.schedules s ON t.schedule_id = s.id
JOIN public.routes r ON s.route_id = r.id
JOIN public.passengers p ON p.identification = '1722334455'
WHERE r.destination = 'Guayaquil'
AND t.trip_date = CURRENT_DATE + 1 -- Reservar para mañana
LIMIT 1;

-- Segundo, se marcan los asientos como reservados
UPDATE public.seats 
SET is_reserved = true,
    reservation_id = (SELECT id FROM public.reservations WHERE confirmation_code = 'CONF-ABC12')
WHERE trip_id = (SELECT trip_id FROM public.reservations WHERE confirmation_code = 'CONF-ABC12')
AND seat_number IN (5, 6);

-- Tercero, se actualiza el número de asientos disponibles en el viaje
UPDATE public.trips 
SET available_seats = available_seats - 2
WHERE id = (SELECT trip_id FROM public.reservations WHERE confirmation_code = 'CONF-ABC12');

-- =================================================================
-- 8. VERIFICAR DATOS INSERTADOS (OPCIONAL)
-- =================================================================
SELECT 'routes' as tabla, COUNT(*) as total FROM public.routes
UNION ALL
SELECT 'buses' as tabla, COUNT(*) as total FROM public.buses
UNION ALL
SELECT 'schedules' as tabla, COUNT(*) as total FROM public.schedules
UNION ALL
SELECT 'trips' as tabla, COUNT(*) as total FROM public.trips
UNION ALL
SELECT 'seats' as tabla, COUNT(*) as total FROM public.seats
UNION ALL
SELECT 'passengers' as tabla, COUNT(*) as total FROM public.passengers
UNION ALL
SELECT 'reservations' as tabla, COUNT(*) as total FROM public.reservations;
