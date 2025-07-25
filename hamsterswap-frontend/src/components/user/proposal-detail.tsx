import { FC, useCallback, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { Col, Row } from "antd";
import { UserAvatarCardItem } from "@/src/components/user-card";
import { utilsProvider } from "@/src/utils/utils.provider";
import { StyledProposalItem } from "@/src/components/proposal-item/proposal-item.style";
import { Button, toast } from "@hamsterbox/ui-kit";
import { CancelProposalModal } from "@/src/components/user/modal/cancel-proposal.modal";
import { ProposalDetailProps } from "./types";
import { CanceledProposalModal } from "@/src/components/user/modal/canceled-proposal.modal";
import { WithdrewProposalModal } from "@/src/components/user/modal/withdrew-proposal.modal";
import { completedOrderPercent, DATE_TIME_FORMAT } from "@/src/utils";
import { SwapProposalStatus } from "@/src/entities/proposal.entity";
import { useProgram } from "@/src/hooks/useProgram";
import { useWallet } from "@/src/hooks/useWallet";
// import { RedeemButton } from "@/src/components/user/redeem-button";
import { useProfilePage } from "@/src/hooks/pages/profile";
import classnames from "classnames";
import ProposalItems from "@/src/components/proposal-item/proposal-items";
import moment from "moment";
import { useAppWallet } from "@/src/hooks/useAppWallet";
import { useMain } from "@/src/hooks/pages/main";

export const ProposalDetail: FC<ProposalDetailProps> = (props) => {
  /** @todo Get all data from @var {props} */
  const { data, status, isGuaranteedPayment } = props;

  const { hPublicProfile: profile, chainId } = useMain();
  const router = useRouter();

  /** @todo Declare all states related to modal appearance */
  const [cancelModal, setCancelModal] = useState(false);
  const [canceledModal, setCanceledModal] = useState(false);
  const [withdrewModal, setWithdrewModal] = useState(false);
  const [isDuringSubmitCancel, setIsDuringSubmitCancel] = useState(false);

  /** @todo Get wallet proivder */
  const { programService } = useWallet();
  const { walletAddress } = useAppWallet();

  /** @todo Condition when proposal is already deposited offered items */
  const isPending = status.valueOf() === SwapProposalStatus.DEPOSITED.valueOf();

  /** @todo Condition when proposal belong to signer */
  const isOwner = useMemo(
    () => walletAddress === props.proposalOwner,
    [props.proposalOwner, walletAddress]
  );

  /** @todo Condition when proposal is expired but not canceled */
  const isExpired =
    status.valueOf() !== SwapProposalStatus.CANCELED.valueOf() &&
    status.valueOf() !== SwapProposalStatus.FULFILLED.valueOf() &&
    status.valueOf() !== SwapProposalStatus.SWAPPED.valueOf() &&
    status.valueOf() !== SwapProposalStatus.REDEEMED.valueOf() &&
    new Date(data?.expiredAt) < new Date();

  /**
   * @dev Import functions from hook.
   */
  const { handleFilter } = useProfilePage();

  /**
   * @dev Condition to render status text.
   */
  const statusText =
    status.valueOf() === SwapProposalStatus.FULFILLED.valueOf() ||
    status.valueOf() === SwapProposalStatus.SWAPPED.valueOf() ||
    status.valueOf() === SwapProposalStatus.REDEEMED.valueOf()
      ? "Swap Success"
      : status.valueOf() === SwapProposalStatus.CANCELED.valueOf() ||
        status.valueOf() === SwapProposalStatus.WITHDRAWN.valueOf()
      ? "Canceled"
      : isExpired && "Expired";

  /**
   * @dev Import program service to use.
   */
  const { cancelProposal } = useProgram();

  /**
   * @dev Condition to show popup to optimize proposal and submit proposal onchain.
   */
  /**
   * @dev Condition whether user want to use with optimize option.
   */
  const isOptimized = useMemo(
    () => router?.query?.optimized === "true",
    [router]
  );

  /**
   * @dev The function to handle cancling proposal
   */
  const handleCancelProposal = useCallback(async () => {
    setIsDuringSubmitCancel(true);

    try {
      await cancelProposal(props.proposalId);
      setCancelModal(false);
      setCanceledModal(true);
      handleFilter();
    } catch (err) {
      toast.error("Cancel proposal failed, please try again later.");
      console.log(err);
    } finally {
      setIsDuringSubmitCancel(false);
    }
  }, [
    props.proposalId,
    router,
    isOptimized,
    walletAddress,
    programService,
    chainId,
  ]);

  /**
   * @dev Handle close successfull canceled modal
   */
  const handleCloseCanceledProposalModal = () => {
    setCanceledModal(false);
    handleFilter();
  };

  /**
   * @dev Handle close successfull withdrew modal
   */
  const handleCloseWithdrewProposalModal = () => {
    setWithdrewModal(false);
    handleFilter();
  };

  return (
    <>
      <StyledProposalItem
        className="w-full bg-[#F8F9FE] min-h-[200px] rounded-[32px] mb-[46px]"
        data-label={isGuaranteedPayment && "Warranty"}
        {...props}
      >
        {isGuaranteedPayment && (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ zIndex: 3 }}
            className="absolute right-0 left-[20px] md:left-[initial] md:right-[86px] w-[37px] top-[40px]"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C11.8733 2 11.7494 2.03642 11.6439 2.10468C9.21698 3.69534 6.45056 4.73004 3.55286 5.13088C3.3995 5.15196 3.25912 5.22616 3.15754 5.33984C3.05597 5.45352 3.00002 5.59903 3 5.74961V11.3745C3 16.2369 5.96743 19.7869 11.7686 21.9581C11.9175 22.014 12.0825 22.014 12.2314 21.9581C18.0339 19.7869 21 16.2382 21 11.3745V5.74961C21 5.59922 20.9443 5.45386 20.8429 5.34021C20.7416 5.22655 20.6016 5.15223 20.4484 5.13088C17.5503 4.73022 14.7834 3.69552 12.3561 2.10468C12.2506 2.03642 12.1267 2 12 2ZM16.2692 10.7431C16.6796 10.3735 16.7127 9.7412 16.3431 9.33081C15.9735 8.92041 15.3412 8.88733 14.9308 9.25691L11.1469 12.6645L9.05641 10.8456C8.63976 10.4831 8.00812 10.5269 7.6456 10.9436C7.28307 11.3602 7.32694 11.9919 7.74359 12.3544L10.5019 14.7544C10.8831 15.0861 11.452 15.0813 11.8275 14.7431L16.2692 10.7431Z"
              fill="white"
            />
          </svg>
        )}
        <div className="relative bg-dark10 w-full h-full min-h-[200px] rounded-[32px] pb-[50px]">
          <div className="px-24">
            <div className="pt-[120px] md:pt-[32px]">
              <UserAvatarCardItem
                id={profile?.id}
                avatar={profile?.avatar}
                orders={profile?.ordersStat.orders}
                completion={completedOrderPercent(
                  profile?.ordersStat.completedOrders,
                  profile?.ordersStat.orders
                )}
                reputation={true}
                walletAddress={utilsProvider.makeShort(
                  profile?.walletAddress,
                  4
                )}
              />
            </div>
            <ProposalItems
              userAssets={props.swapItems}
              userLookingFor={props.receiveItems}
              fulfilledWithOptionId={data.fulfilledWithOptionId}
            />
            <Row className="mt-4">
              <Col span={isPending ? 10 : 24}>
                <div className="md:left">
                  <p className="semi-bold text-[16px] h-[36px] leading-9">
                    Note
                  </p>
                  <p className="mt-[12px] text-[16px] regular-text break-all">
                    {data?.note}
                  </p>
                  <p className="mt-[12px] text-[16px] regular-text text-dark60">
                    Expiration date:{" "}
                    {moment(data?.expiredAt).utc().format(DATE_TIME_FORMAT)}
                  </p>
                  {statusText && (
                    <p className="mt-[12px] text-[16px] regular-text text-dark60">
                      Status:{" "}
                      {status === SwapProposalStatus.FULFILLED.valueOf() ||
                      status === SwapProposalStatus.SWAPPED.valueOf() ||
                      status.valueOf() ===
                        SwapProposalStatus.REDEEMED.valueOf() ? (
                        <span className="text-green font-bold">
                          {statusText}
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold capitalize">
                          {statusText}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </Col>
            </Row>
            <div className="flex mt-[20px] justify-between">
              <div className="flex justify-center">
                {isOwner && (
                  <div className="h-full">
                    {/*<RedeemButton*/}
                    {/*  status={status}*/}
                    {/*  proposalId={proposalId}*/}
                    {/*  isOwner={isOwner}*/}
                    {/*/>*/}
                    {status.valueOf() !==
                      SwapProposalStatus.WITHDRAWN.valueOf() &&
                      isExpired && (
                        <>
                          <Button
                            className="border-purple text-purple !border-2 px-10 rounded-3xl !h-full"
                            onClick={() => handleCancelProposal()}
                            size="large"
                            text="Withdraw"
                            shape="secondary"
                            loading={isDuringSubmitCancel}
                          />
                          <WithdrewProposalModal
                            isModalOpen={withdrewModal}
                            handleCancel={handleCloseWithdrewProposalModal}
                            handleOk={handleCloseWithdrewProposalModal}
                          />
                        </>
                      )}
                  </div>
                )}
              </div>
              {!isExpired && (
                <div className="flex justify-center">
                  {isOwner && isPending && (
                    <>
                      <button
                        className="border-red-500 text-red-500 !border-2 px-10 rounded-3xl"
                        onClick={() => setCancelModal(true)}
                      >
                        Cancel Proposal
                      </button>
                      <CancelProposalModal
                        isLoading={isDuringSubmitCancel}
                        isModalOpen={cancelModal}
                        handleCancel={() => setCancelModal(false)}
                        handleOk={() => handleCancelProposal()}
                      />
                      <CanceledProposalModal
                        isModalOpen={canceledModal}
                        handleCancel={handleCloseCanceledProposalModal}
                        handleOk={handleCloseCanceledProposalModal}
                      />
                    </>
                  )}
                  {status.valueOf() ===
                    SwapProposalStatus.DEPOSITED.valueOf() && (
                    <div className="ml-4">
                      <Button
                        className={classnames(
                          "!rounded-[100px] after:!rounded-[100px] !px-10 relative"
                        )}
                        text="View on Market"
                        onClick={() => router.push(`/proposal/${data.id}`)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </StyledProposalItem>
    </>
  );
};
