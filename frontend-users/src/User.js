import './assets/sass/app.scss';
import Footer from './layouts/Footer';
import Header from './layouts/Header';
import Main from './layouts/Main';
import Nav from './layouts/Nav';
import NewsLetter from './layouts/NewsLetter';
import QuickView from './pages/home/QuickView';
function User() {
  const conversationId = 2; // ID cuộc trò chuyện
  const senderId = 14; // ID người gửi
  return (
    <div>
      <QuickView />
      <Header/>
      <Nav id="1"/>
      <Main/>
      <NewsLetter/>
      <Footer/>
    </div>
  );
}

export default User;