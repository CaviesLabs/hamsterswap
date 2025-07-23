import { FC, ReactNode } from "react";
import { useMain } from "@/src/hooks/pages/main";
import Footer from "@/src/components/footer";
import AuthMiddleware from "@/src/components/middlewares/auth";
import animationData from "@/src/components/icons/animation-loading.json";
import dynamic from "next/dynamic";

const HeaderDynamic = dynamic(() => import("@/src/components/header"), {
  ssr: false,
});
const LottieDynamic = dynamic(() => import("react-lottie"), { ssr: false });

export interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const { transitionLoading, fistLoading } = useMain();

  return (
    <AuthMiddleware>
      <div className="main-layout">
        <HeaderDynamic />
        <div className="layout-content">{children}</div>
        <Footer />
      </div>
      {fistLoading && (
        <div
          className="w-full h-full fixed top-0 bottom-0 right-0 left-0 bg-white"
          style={{ zIndex: 100 }}
        >
          <LottieDynamic
            style={{ width: "300px" }}
            options={{
              animationData,
            }}
          />
        </div>
      )}
      {transitionLoading && (
        <div
          className="w-[185px] fixed bottom-[20px] right-[81px]"
          style={{ zIndex: 100 }}
        >
          <LottieDynamic
            options={{
              animationData,
            }}
          />
        </div>
      )}
    </AuthMiddleware>
  );
};

export default MainLayout;
