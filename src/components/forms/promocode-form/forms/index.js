import React from "react";

import GenericBasePCForm from './generic-base-pc-form'
import SpeakerBasePCForm from './speaker-base-pc-form'
import MemberBasePCForm from './member-base-pc-form'
import SponsorBasePCForm from './sponsor-base-pc-form'
import DiscountBasePCForm from './discount-base-pc-form'
import SpeakersBasePCForm from './speakers-base-pc-form'

export const MemberPCForm = (props) => (
  <>
    <MemberBasePCForm {...props} />
    <GenericBasePCForm {...props} />
  </>
);

export const SpeakerPCForm = (props) => (
  <>
    <SpeakerBasePCForm {...props} />
    <GenericBasePCForm {...props} />
  </>
);

export const SponsorPCForm = (props) => (
  <>
    <SponsorBasePCForm {...props} />
    <GenericBasePCForm {...props} />
  </>
);

export const MemberDiscountPCForm = (props) => (
  <>
    <MemberBasePCForm {...props} />
    <DiscountBasePCForm {...props} />
  </>
);

export const SpeakerDiscountPCForm = (props) => (
  <>
    <SpeakerBasePCForm {...props} />
    <DiscountBasePCForm {...props} />
  </>
);

export const SponsorDiscountPCForm = (props) => (
  <>
    <SponsorBasePCForm {...props} />
    <DiscountBasePCForm {...props} />
  </>
);

export const SummitPCForm = (props) => (
  <>
    <GenericBasePCForm {...props} />
  </>
);

export const SummitDiscountPCForm = (props) => (
  <>
    <DiscountBasePCForm {...props} />
  </>
);

export const SpeakersPCForm = (props) => (
  <>
    <SpeakersBasePCForm {...props} />
    <GenericBasePCForm {...props} />
  </>
);

export const SpeakersDiscountPCForm = (props) => (
  <>
    <SpeakersBasePCForm {...props} />
    <DiscountBasePCForm {...props} />
  </>
);