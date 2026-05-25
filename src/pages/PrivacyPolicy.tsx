
import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Политика конфиденциальности</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Общие положения</h2>
        <p className="text-gray-400 leading-relaxed">
          Настоящая политика конфиденциальности регулирует порядок обработки и защиты
          персональных данных пользователей сайта LSAuto (далее — Сайт).
          Используя Сайт, вы соглашаетесь с условиями настоящей политики.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Какие данные мы собираем</h2>
        <ul className="list-disc pl-6 text-gray-400 space-y-1">
          <li>Имя и адрес электронной почты (при регистрации)</li>
          <li>Номер телефона (по желанию пользователя)</li>
          <li>Город (по желанию пользователя)</li>
          <li>Фотографии автомобилей (загружаемые поставщиками)</li>
          <li>Документы для верификации (паспорт, ИНН) — только для поставщиков</li>
          <li>История сообщений в чате</li>
          <li>IP-адрес и технические данные сессии</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Цели обработки данных</h2>
        <ul className="list-disc pl-6 text-gray-400 space-y-1">
          <li>Идентификация пользователя на Сайте</li>
          <li>Обеспечение работы функций Сайта (чат, заявки, каталог)</li>
          <li>Верификация поставщиков</li>
          <li>Отправка уведомлений о новых заявках и сообщениях</li>
          <li>Предотвращение мошенничества</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. Хранение и защита данных</h2>
        <p className="text-gray-400 leading-relaxed">
          Персональные данные хранятся на защищённых серверах. Документы для верификации
          (KYC) доступны только самому пользователю и администраторам Сайта.
          Мы не передаём персональные данные третьим лицам без согласия пользователя,
          за исключением случаев предусмотренных законодательством РФ.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Права пользователя</h2>
        <p className="text-gray-400 leading-relaxed">
          Вы вправе запросить удаление своих персональных данных, направив запрос
          на электронную почту администрации Сайта. Данные будут удалены в течение 30 дней.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
        <p className="text-gray-400 leading-relaxed">
          Сайт использует cookies для авторизации пользователей. Cookie содержит
          зашифрованный токен сессии и не содержит персональных данных в открытом виде.
        </p>
      </section>

      <p className="text-sm text-gray-500 mt-8">
        Последнее обновление: {new Date().toLocaleDateString('ru')}
      </p>
    </div>
  );
};

export default PrivacyPolicy;
