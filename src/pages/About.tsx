
import { ShieldCheck, Target, Zap, Award, CheckCircle2 } from 'lucide-react';

const Block = ({ icon: Icon, title, children }: any) => (
  <div className="bg-dark-card border border-white/5 p-8 rounded-3xl space-y-4">
    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
      <Icon size={28} />
    </div>
    <h3 className="text-2xl font-bold">{title}</h3>
    <div className="text-gray-400 leading-relaxed space-y-4">
      {children}
    </div>
  </div>
);

export const About = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 space-y-20">
      <section className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-black">LS<span className="text-primary">Auto</span></h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Мы меняем правила игры на рынке импорта автомобилей, делая процесс прозрачным, безопасным и быстрым для каждого.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Block icon={Target} title="О компании">
          <p>
            LSAuto — это не просто маркетплейс, это технологическая платформа, объединяющая проверенных поставщиков из крупнейших автомобильных хабов мира с покупателями в России.
          </p>
          <p>
            Наша миссия — устранить информационный вакуум и предоставить пользователям инструменты для принятия взвешенных решений на основе реальных данных и трендов.
          </p>
        </Block>

        <Block icon={Zap} title="Как мы работаем">
          <ul className="space-y-3">
            {[
              'Вы выбираете автомобиль в каталоге или оставляете запрос',
              'Проверенные поставщики предлагают свои варианты',
              'Вы обсуждаете детали напрямую в защищенном чате',
              'Платформа контролирует чистоту сделки на каждом этапе',
              'Автомобиль доставляется в ваш город в кратчайшие сроки'
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-primary font-bold">{i + 1}.</span>
                {text}
              </li>
            ))}
          </ul>
        </Block>

        <Block icon={ShieldCheck} title="Проверка поставщиков">
          <p>
            Безопасность — наш главный приоритет. Каждый поставщик проходит 5 этапов проверки:
          </p>
          <ul className="space-y-2">
            {[
              'Юридическая проверка документов (ИНН, ОГРН)',
              'Проверка истории внешнеэкономической деятельности',
              'Верификация физических площадок и офисов',
              'Контроль отзывов от реальных клиентов',
              'Подписание договора об ответственности'
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-primary" />
                {text}
              </li>
            ))}
          </ul>
        </Block>

        <Block icon={Award} title="Гарантии и безопасность">
          <p>
            Мы гарантируем достоверность информации о каждом автомобиле и поставщике, представленном на платформе.
          </p>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 mt-4">
            <h4 className="font-bold text-sm mb-2">LSAuto Protect</h4>
            <p className="text-xs text-gray-500 italic">
              «В случае выявления несоответствия заявленным параметрам или недобросовестности поставщика, наша служба безопасности берет на себя решение конфликта.»
            </p>
          </div>
        </Block>
      </div>

      <section className="bg-primary text-black p-12 rounded-3xl text-center space-y-8">
        <h2 className="text-3xl md:text-5xl font-black">Почему нам доверяют?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { val: '2500+', lab: 'Автомобилей ввозится ежемесячно' },
            { val: '500+', lab: 'Верифицированных поставщиков' },
            { val: '98%', lab: 'Довольных клиентов' },
            { val: '0 ₽', lab: 'Комиссия за поиск и подбор' }
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl font-black">{stat.val}</div>
              <div className="text-xs font-bold uppercase opacity-70">{stat.lab}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
