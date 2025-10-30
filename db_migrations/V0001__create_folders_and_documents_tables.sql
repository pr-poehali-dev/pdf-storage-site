CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    folder_id INTEGER NOT NULL REFERENCES folders(id),
    upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
    size VARCHAR(50) NOT NULL DEFAULT '1.0 MB',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO folders (name, color, icon) VALUES
('Контракты', 'bg-purple-100 text-purple-700', 'FileText'),
('Отчеты', 'bg-blue-100 text-blue-700', 'BarChart3'),
('Инструкции', 'bg-green-100 text-green-700', 'BookOpen'),
('Финансы', 'bg-orange-100 text-orange-700', 'Wallet');

INSERT INTO documents (name, description, folder_id, upload_date, size) VALUES
('Договор поставки оборудования', 'Контракт на поставку серверного оборудования для ЦОД', 1, '2024-03-15', '2.4 MB'),
('Квартальный отчет Q1', 'Финансовый отчет за первый квартал 2024 года', 2, '2024-04-01', '1.8 MB'),
('Руководство пользователя CRM', 'Подробная инструкция по работе с CRM системой', 3, '2024-02-20', '5.2 MB'),
('Бюджет на 2024 год', 'Утвержденный бюджет компании на текущий финансовый год', 4, '2024-01-10', '3.1 MB'),
('Договор аренды офиса', 'Соглашение об аренде офисного помещения', 1, '2024-03-01', '1.2 MB'),
('Отчет по продажам', 'Аналитика продаж за последний месяц', 2, '2024-04-05', '900 KB');