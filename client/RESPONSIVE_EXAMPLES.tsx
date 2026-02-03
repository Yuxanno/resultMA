/**
 * 📱 ПРИМЕРЫ РЕСПОНСИВНЫХ КОМПОНЕНТОВ
 * 
 * Этот файл содержит готовые примеры для копирования в ваши компоненты
 */

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, MobileCard, MobileCardRow } from '@/components/ui/Table';
import { Users, Plus, Edit, Trash } from 'lucide-react';

// ============================================
// 1. АДАПТИВНАЯ СТРАНИЦА С GRID
// ============================================
export function ResponsiveDashboard() {
  return (
    <div className="container-responsive py-responsive">
      <PageHeader
        title="Панель управления"
        description="Обзор основных показателей"
        icon={Users}
        actions={
          <div className="flex gap-2 w-full sm:w-auto">
            <Button fullWidth className="sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Создать
            </Button>
          </div>
        }
      />

      {/* Stats Grid - 1 колонка на мобильных, 4 на десктопе */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl sm:text-3xl font-bold">1,234</div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Пользователи</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl sm:text-3xl font-bold">567</div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Заказы</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl sm:text-3xl font-bold">$12,345</div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Доход</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl sm:text-3xl font-bold">+23%</div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">Рост</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Последние заказы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Контент */}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Контент */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// 2. АДАПТИВНАЯ ТАБЛИЦА С МОБИЛЬНЫМИ КАРТОЧКАМИ
// ============================================
export function ResponsiveTable() {
  const users = [
    { id: 1, name: 'Иван Иванов', email: 'ivan@example.com', role: 'Админ' },
    { id: 2, name: 'Мария Петрова', email: 'maria@example.com', role: 'Пользователь' },
  ];

  return (
    <div className="container-responsive py-responsive">
      <PageHeader
        title="Пользователи"
        icon={Users}
        actions={
          <Button fullWidth className="sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Добавить
          </Button>
        }
      />

      {/* Поиск и фильтры */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Поиск..."
          className="flex-1"
        />
        <Button variant="outline" className="sm:w-auto">
          Фильтры
        </Button>
      </div>

      {/* ДЕСКТОП - Таблица */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* МОБИЛЬНЫЙ - Карточки */}
      <div className="lg:hidden space-y-3">
        {users.map(user => (
          <MobileCard key={user.id}>
            <MobileCardRow label="Имя">
              {user.name}
            </MobileCardRow>
            <MobileCardRow label="Email">
              {user.email}
            </MobileCardRow>
            <MobileCardRow label="Роль">
              {user.role}
            </MobileCardRow>
            <div className="flex gap-2 pt-3 border-t border-border/50">
              <Button size="sm" variant="outline" fullWidth>
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
              <Button size="sm" variant="destructive" fullWidth>
                <Trash className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            </div>
          </MobileCard>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 3. АДАПТИВНАЯ ФОРМА
// ============================================
export function ResponsiveForm() {
  return (
    <div className="container-responsive py-responsive">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Создать пользователя"
          description="Заполните форму для создания нового пользователя"
        />

        <Card>
          <CardContent className="pt-6">
            <form className="space-y-4 sm:space-y-6">
              {/* Одна колонка на мобильных */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Имя"
                  placeholder="Введите имя"
                  required
                />
                <Input
                  label="Фамилия"
                  placeholder="Введите фамилию"
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="example@mail.com"
                required
              />

              <Input
                label="Телефон"
                type="tel"
                placeholder="+998 90 123 45 67"
              />

              {/* Кнопки - колонка на мобильных, ряд на десктопе */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  className="sm:w-auto"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  className="sm:w-auto sm:ml-auto"
                >
                  Создать пользователя
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// 4. АДАПТИВНОЕ МОДАЛЬНОЕ ОКНО
// ============================================
export function ResponsiveModalExample() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Открыть модальное окно
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Редактировать профиль"
        description="Обновите информацию о вашем профиле"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              fullWidth
              className="sm:w-auto"
            >
              Отмена
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              fullWidth
              className="sm:w-auto"
            >
              Сохранить
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Имя" placeholder="Ваше имя" />
          <Input label="Email" type="email" placeholder="your@email.com" />
          <Input label="Телефон" type="tel" placeholder="+998 90 123 45 67" />
        </div>
      </Modal>
    </>
  );
}

// ============================================
// 5. АДАПТИВНАЯ КАРТОЧКА ПРОДУКТА
// ============================================
export function ResponsiveProductCard() {
  return (
    <Card className="overflow-hidden">
      {/* Изображение */}
      <div className="aspect-video sm:aspect-square lg:aspect-video bg-muted">
        <img
          src="/product.jpg"
          alt="Product"
          className="w-full h-full object-cover"
        />
      </div>

      <CardContent className="p-4 sm:p-6">
        {/* Заголовок */}
        <h3 className="text-lg sm:text-xl font-bold mb-2">
          Название продукта
        </h3>

        {/* Описание */}
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          Краткое описание продукта, которое адаптируется под размер экрана
        </p>

        {/* Цена и кнопка */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-2xl sm:text-3xl font-bold text-primary">
            $99.99
          </div>
          <Button fullWidth className="sm:w-auto">
            Купить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// 6. АДАПТИВНАЯ НАВИГАЦИЯ
// ============================================
export function ResponsiveNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b border-border">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg" />
            <span className="text-lg sm:text-xl font-bold">Logo</span>
          </div>

          {/* Десктоп меню */}
          <div className="hidden lg:flex items-center gap-6">
            <a href="#" className="text-sm font-medium hover:text-primary">
              Главная
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              О нас
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              Контакты
            </a>
            <Button size="sm">Войти</Button>
          </div>

          {/* Мобильное меню кнопка */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-3">
              <a href="#" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg">
                Главная
              </a>
              <a href="#" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg">
                О нас
              </a>
              <a href="#" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg">
                Контакты
              </a>
              <div className="px-4 pt-3 border-t border-border">
                <Button fullWidth>Войти</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ============================================
// 7. АДАПТИВНЫЙ СПИСОК С ФИЛЬТРАМИ
// ============================================
export function ResponsiveListWithFilters() {
  return (
    <div className="container-responsive py-responsive">
      <PageHeader
        title="Каталог"
        description="Найдите нужный товар"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Боковая панель фильтров - полная ширина на мобильных */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Фильтры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Категория
                </label>
                <select className="w-full h-11 rounded-lg border-2 border-input px-3">
                  <option>Все категории</option>
                  <option>Электроника</option>
                  <option>Одежда</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Цена
                </label>
                <div className="flex gap-2">
                  <Input placeholder="От" />
                  <Input placeholder="До" />
                </div>
              </div>
              <Button fullWidth>Применить</Button>
            </CardContent>
          </Card>
        </aside>

        {/* Основной контент */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <div className="aspect-square bg-muted" />
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">Товар {i}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Описание товара
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">$99</span>
                    <Button size="sm">Купить</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 8. АДАПТИВНЫЕ ВКЛАДКИ
// ============================================
export function ResponsiveTabs() {
  const [activeTab, setActiveTab] = React.useState('overview');

  return (
    <div className="container-responsive py-responsive">
      <Card>
        {/* Вкладки - скроллятся на мобильных */}
        <div className="border-b border-border overflow-x-auto">
          <div className="flex min-w-max sm:min-w-0 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Обзор
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'details'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Детали
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Отзывы
            </button>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6">
          {activeTab === 'overview' && <div>Контент обзора</div>}
          {activeTab === 'details' && <div>Контент деталей</div>}
          {activeTab === 'reviews' && <div>Контент отзывов</div>}
        </CardContent>
      </Card>
    </div>
  );
}

export default {
  ResponsiveDashboard,
  ResponsiveTable,
  ResponsiveForm,
  ResponsiveModalExample,
  ResponsiveProductCard,
  ResponsiveNavigation,
  ResponsiveListWithFilters,
  ResponsiveTabs,
};
