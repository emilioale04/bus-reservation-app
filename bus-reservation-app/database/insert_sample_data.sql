-- =================================================================
-- Script de Inserción de Datos para el Sistema de Reservas de Autobuses
-- Este script debe ejecutarse DESPUÉS de crear las tablas.
-- =================================================================

-- Usamos CTEs (Common Table Expressions) para insertar datos en orden
-- y reutilizar los IDs generados en las siguientes inserciones.

WITH inserted_routes AS (
    INSERT INTO public.routes (origin, destination, duration_minutes, price) VALUES
    ('Quito', 'Guayaquil', 480, 15.00),
    ('Quito', 'Tulcán', 300, 7.50),
    ('Quito', 'Loja', 660, 20.00),
    ('Quito', 'Lago Agrio', 450, 14.00),
    ('Quito', 'Esmeraldas', 390, 11.50)
    RETURNING id, destination
),

inserted_schedules AS (
    INSERT INTO public.schedules (route_id, departure_time, days_of_week, is_active)
    SELECT 
        r.id,
        s.departure_time,
        ARRAY[1,2,3,4,5,6,7]::integer[], 
        true
    FROM inserted_routes r,
    (VALUES ('08:00:00'), ('12:00:00'), ('22:00:00')) AS s(departure_time)
    RETURNING id, route_id, departure_time
),

inserted_buses AS (
    INSERT INTO public.buses (bus_number, route_id, capacity)
    SELECT 'QG-' || generate_series(101, 108), r.id, 40 FROM inserted_routes r WHERE r.destination = 'Guayaquil'
    UNION ALL
    SELECT 'QT-' || generate_series(201, 204), r.id, 40 FROM inserted_routes r WHERE r.destination = 'Tulcán'
    UNION ALL
    SELECT 'QL-' || generate_series(301, 304), r.id, 40 FROM inserted_routes r WHERE r.destination = 'Loja'
    UNION ALL
    SELECT 'QLA-' || generate_series(401, 404), r.id, 40 FROM inserted_routes r WHERE r.destination = 'Lago Agrio'
    UNION ALL
    SELECT 'QE-' || generate_series(501, 504), r.id, 40 FROM inserted_routes r WHERE r.destination = 'Esmeraldas'
    RETURNING id, route_id
),

inserted_passengers AS (
    INSERT INTO public.passengers (identification, name, email, phone, address) VALUES
    ('1722334455', 'Carlos Solis', 'carlos.solis@email.com', '0987654321', 'Av. Amazonas 123, Quito'),
    ('0988776655', 'Ana Paredes', 'ana.paredes@email.com', '0998877665', 'Calle Larga 456, Cuenca')
    RETURNING id, identification, name, email, phone, address
),

inserted_trips AS (
    INSERT INTO public.trips (bus_id, schedule_id, trip_date, available_seats)
    SELECT b.id, s.id, CURRENT_DATE, 40
    FROM inserted_schedules s
    JOIN inserted_buses b ON s.route_id = b.route_id
    WHERE s.departure_time = '08:00:00' AND b.id = (SELECT id FROM inserted_buses LIMIT 1)
    UNION ALL
    SELECT b.id, s.id, CURRENT_DATE + 1, 40
    FROM inserted_schedules s
    JOIN inserted_buses b ON s.route_id = b.route_id
    WHERE s.departure_time = '22:00:00' AND b.id = (SELECT id FROM inserted_buses WHERE route_id = s.route_id LIMIT 1)
    RETURNING id, trip_date
),

inserted_reservations AS (
    INSERT INTO public.reservations (trip_id, passenger_id, passenger_name, passenger_email, passenger_phone, passenger_address, seat_numbers, total_amount, payment_status, payment_method, confirmation_code)
    SELECT 
        (SELECT id FROM inserted_trips WHERE trip_date = CURRENT_DATE),
        p.id, p.name, p.email, p.phone, p.address,
        ARRAY[5, 6],
        (SELECT price FROM public.routes WHERE destination = 'Guayaquil') * 2,
        'pending', 'credit_card', 'CONF-ABC12'
    FROM inserted_passengers p WHERE p.identification = '1722334455'
    UNION ALL
    SELECT 
        (SELECT id FROM inserted_trips WHERE trip_date = CURRENT_DATE + 1),
        p.id, p.name, p.email, p.phone, p.address,
        ARRAY[10],
        (SELECT price FROM public.routes WHERE destination = 'Loja'),
        'pending', 'cash', 'CONF-XYZ78'
    FROM inserted_passengers p WHERE p.identification = '0988776655'
    RETURNING id, trip_id, confirmation_code, seat_numbers
),

inserted_seats AS (
    INSERT INTO public.seats (trip_id, seat_number, is_reserved, reservation_id)
    SELECT
        ir.trip_id,
        unnest(ir.seat_numbers),
        true,
        ir.id
    FROM inserted_reservations ir
    RETURNING id, reservation_id
)

INSERT INTO public.payments (reservation_id, amount, payment_method, status, transaction_id, card_last_four)
SELECT
    r.id,
    res.total_amount,
    res.payment_method,
    'completed',
    'TXN-' || substr(md5(random()::text), 0, 15),
    CASE WHEN res.payment_method = 'credit_card' THEN '4242' ELSE NULL END
FROM public.reservations res
JOIN inserted_reservations r ON res.confirmation_code = r.confirmation_code;
