import React, { useState, useEffect } from "react";
import { FormStep, UploadFile, CardLabelDesc, Dropdown, CardLabel } from "@egovernments/digit-ui-react-components";
import { stringReplaceAll } from "../utils";
import { useLocation } from "react-router-dom";
import Timeline from "../components/TLTimeline";

const SelectProofIdentity = ({ t, config, onSelect, userType, formData, ownerIndex = 0, addNewOwner }) => {
  const { pathname: url } = useLocation();
  // const editScreen = url.includes("/modify-application/");
  const isMutation = url.includes("property-mutation");

  // let index = "0";
  // isMutation ? ownerIndex : window.location.href.charAt(window.location.href.length - 1);

  const [uploadedFile, setUploadedFile] = useState(() => formData?.document?.proofIdentity?.fileStoreId || null);
  const [file, setFile] = useState(formData?.document?.proofIdentity);
  const [error, setError] = useState(null);
  const cityDetails = Digit.ULBService.getCurrentUlb();
  const onSkip = () => onSelect();
  const isUpdateProperty = formData?.isUpdateProperty || false;
  let isEditProperty = formData?.isEditProperty || false;

  console.log("formdata in docccc--------------------------*********", formData);

  const [dropdownValue, setDropdownValue] = useState(formData?.document?.documents?.proofIdentity?.documentType);
  let dropdownData = [];
  let dropdownData1 = [];
  let dropdownData2 = [];
  let dropdownData3 = [];

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  const { isLoading, data } = Digit.Hooks.ptr.usePetMDMS(stateId, "PetService", "Documents");

  const PTRDocument = data?.PetService?.Documents.map((document) => ({
    ...document,
    hasDropdown: true,
  }));

  const proofIdentity = Array.isArray(PTRDocument) && PTRDocument;
  if (proofIdentity.length > 0) {
    dropdownData = proofIdentity[0]?.dropdownData;
    dropdownData1 = proofIdentity[1]?.dropdownData;
    dropdownData2 = proofIdentity[2]?.dropdownData;
    dropdownData3 = proofIdentity[3]?.dropdownData;

    dropdownData.forEach((data) => {
      data.i18nKey = stringReplaceAll(data.code, ".", "_");
    });

    dropdownData1.forEach((data) => {
      data.i18nKey = stringReplaceAll(data.code, ".", "_");
    });

    dropdownData2.forEach((data) => {
      data.i18nKey = stringReplaceAll(data.code, ".", "_");
    });

    dropdownData3.forEach((data) => {
      data.i18nKey = stringReplaceAll(data.code, ".", "_");
    });
  }
  ///////////////////////////// check for localization codes///////////////////
  const localizationCodes = [
    ...dropdownData.map((data) => data.code),
    ...dropdownData1.map((data) => data.code),
    ...dropdownData2.map((data) => data.code),
    ...dropdownData3.map((data) => data.code),
  ];
  console.log("dfdfdffdfdff", localizationCodes);
  function setTypeOfDropdownValue(dropdownValue) {
    setDropdownValue(dropdownValue);
  }

  function selectfile(e) {
    setFile(e.target.files[0]);
  }

  function selectfile1(e) {
    setFile(e.target.files[1]);
  }

  function selectfile2(e) {
    setFile(e.target.files[2]);
  }

  function selectfile3(e) {
    setFile(e.target.files[3]);
  }

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        if (file.size >= 2000000) {
          setError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        } else {
          try {
            // TODO: change module in file storage
            const response = await Digit.UploadServices.Filestorage("property-upload", file, Digit.ULBService.getStateId());
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("PT_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {}
        }
      }
    })();
  }, [file]);

  const [multipleownererror, setmultipleownererror] = useState(null);

  const handleSubmit = () => {
    setmultipleownererror(null);
    if (formData?.docchipCategory?.code === "INDIVIDUAL.MULTIPLEOWNERS" && formData?.document?.length <= 1 && !isMutation) {
      setmultipleownererror("PT_MULTI_OWNER_ADD_ERR_MSG");
    } else if (isMutation && formData?.document?.length <= 1 && formData?.docchipCategory?.code === "INDIVIDUAL.MULTIPLEOWNERS") {
      setmultipleownererror("PT_MULTI_OWNER_ADD_ERR_MSG");
    } else {
      let fileStoreId = uploadedFile;
      let fileDetails = file;
      if (fileDetails) {
        fileDetails.documentType = dropdownValue;
        fileDetails.fileStoreId = fileStoreId ? fileStoreId : null;
      }
      let ownerDetails = formData.document && formData.document;
      if (ownerDetails && ownerDetails.documents) {
        if (!isMutation) ownerDetails.documents["proofIdentity"] = fileDetails;
        else ownerDetails.documents["proofIdentity"] = { documentType: dropdownValue, fileStoreId };
      }
      //  else {

      //   if (!isMutation) {
      //     ownerDetails["documents"] = [];
      //     ownerDetails.documents["proofIdentity"] = fileDetails;
      //   } else {
      //     ownerDetails["documents"] = {};
      //     ownerDetails.documents["proofIdentity"] = { documentType: dropdownValue, fileStoreId };
      //   }
      // }

      onSelect(config.key, isMutation ? [ownerDetails] : ownerDetails, "");
    }
    // onSelect(config.key, { specialProofIdentity: fileDetails }, "", index);
  };

  function onAdd() {
    if (isMutation) {
      if (!uploadedFile || !dropdownValue) {
        setError(t("ERR_DEFAULT_INPUT_FIELD_MSG"));
        return;
      }
      let ownerDetails = formData.document && formData.document;
      if (ownerDetails && ownerDetails.documents) {
        ownerDetails.documents["proofIdentity"] = { documentType: dropdownValue, fileStoreId: uploadedFile };
      } else {
        ownerDetails["documents"] = {};
        ownerDetails.documents["proofIdentity"] = { documentType: dropdownValue, fileStoreId: uploadedFile };
      }
      addNewOwner(ownerDetails);
      return;
    }

    // let newIndex = parseInt(index) + 1;
    let fileStoreId = uploadedFile;
    let fileDetails = file;
    if (fileDetails) {
      fileDetails.documentType = dropdownValue;
      fileDetails.fileStoreId = fileStoreId ? fileStoreId : null;
    }
    let ownerDetails = formData.document && formData.document;
    if (ownerDetails && ownerDetails.documents) {
      ownerDetails.documents["proofIdentity"] = fileDetails;
    } else {
      ownerDetails["documents"] = [];
      ownerDetails.documents["proofIdentity"] = fileDetails;
    }
    onSelect("owner-details", {}, false, true);
  }

  const checkMutatePT = window.location.href.includes("citizen/pt/property/property-mutation/") ? (
    <Timeline currentStep={1} flow="PT_MUTATE" />
  ) : (
    <Timeline currentStep={4} />
  );

  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? checkMutatePT : null}
      <FormStep
        t={t}
        config={config}
        onSelect={handleSubmit}
        onSkip={onSkip}
        forcedError={t(multipleownererror)}
        isDisabled={isUpdateProperty || isEditProperty ? false : multipleownererror || !uploadedFile || !dropdownValue || error}
        onAdd={onAdd}
        isMultipleAllow={formData?.docchipCategory?.value == "INDIVIDUAL.MULTIPLEOWNERS"}
      >
        {/* {components_ar} */}

        <CardLabel>{`${t("PET_OWNER_IDENTITYPROOF_HEADING")}`}</CardLabel>
        <Dropdown t={t} isMandatory={false} option={dropdownData} selected={dropdownValue} optionKey="i18nKey" select={setTypeOfDropdownValue} />
        <UploadFile
          id={"pt-doc"}
          extraStyleName={"propertyCreate"}
          accept=".jpg,.png,.pdf"
          onUpload={selectfile}
          onDelete={() => {
            setUploadedFile(null);
          }}
          message={uploadedFile ? `1 ${t(`PTR_ACTION_FILEUPLOADED`)}` : t(`PTR_ACTION_NO_FILEUPLOADED`)}
          error={error}
        />
        <br></br>

        <CardLabel>{`${t("PTR_OWNER_PHOTO")}`}</CardLabel>
        <Dropdown t={t} isMandatory={false} option={dropdownData1} selected={dropdownValue} optionKey="i18nKey" select={setTypeOfDropdownValue} />
        <UploadFile
          id={"pt-doc"}
          extraStyleName={"propertyCreate"}
          accept=".jpg,.png,.pdf"
          onUpload={selectfile1}
          onDelete={() => {
            setUploadedFile(null);
          }}
          message={uploadedFile ? `1 ${t(`PTR_ACTION_FILEUPLOADED`)}` : t(`PTR_ACTION_NO_FILEUPLOADED`)}
          error={error}
        />
        <br></br>

        <CardLabel>{`${t("PTR_VACCINATION_CERTIFICATE")}`}</CardLabel>
        <Dropdown t={t} isMandatory={false} option={dropdownData2} selected={dropdownValue} optionKey="i18nKey" select={setTypeOfDropdownValue} />
        <UploadFile
          id={"pt-doc"}
          extraStyleName={"propertyCreate"}
          accept=".jpg,.png,.pdf"
          onUpload={selectfile2}
          onDelete={() => {
            setUploadedFile(null);
          }}
          message={uploadedFile ? `1 ${t(`PTR_ACTION_FILEUPLOADED`)}` : t(`PTR_ACTION_NO_FILEUPLOADED`)}
          error={error}
        />
        <br></br>
        <CardLabel>{`${t("PTR_OWNER_PHOTO")}`}</CardLabel>
        <Dropdown t={t} isMandatory={false} option={dropdownData3} selected={dropdownValue} optionKey="i18nKey" select={setTypeOfDropdownValue} />
        <UploadFile
          id={"pt-doc"}
          extraStyleName={"propertyCreate"}
          accept=".jpg,.png,.pdf"
          onUpload={selectfile3}
          onDelete={() => {
            setUploadedFile(null);
          }}
          message={uploadedFile ? `1 ${t(`PTR_ACTION_FILEUPLOADED`)}` : t(`PTR_ACTION_NO_FILEUPLOADED`)}
          error={error}
        />

        {error ? <div style={{ height: "20px", width: "100%", fontSize: "20px", color: "red", marginTop: "5px" }}>{error}</div> : ""}
        <div style={{ disabled: "true", height: "20px", width: "100%" }}></div>
      </FormStep>
    </React.Fragment>
  );
};

export default SelectProofIdentity;
