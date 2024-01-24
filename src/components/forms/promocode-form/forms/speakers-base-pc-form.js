import React, {useEffect} from "react";
import Swal from "sweetalert2";
import T from "i18n-react";
import {FreeTextSearch, SpeakerInput, Table} from "openstack-uicore-foundation/lib/components";
import {Pagination} from "react-bootstrap";

const SpeakersBasePCForm = (props) => {
  const {entity, summit} = props;
  const {speakers: {filtered_speakers_list, term, order, orderDir, currentPage, lastPage}} = entity;

  useEffect(() => {
    const {entity} = props;
    if (entity.id) props.getAssignedSpeakers(entity);
  }, [entity.id]);

  const handleSpeakerAssignment = (ev) => {
    const {assignSpeaker, entity} = props;
    ev.preventDefault();
    if (entity.speaker) assignSpeaker(entity);
  }

  const handleDelete = (speakerId) => {
    const {unAssignSpeaker, entity: {class_name, id, speakers}} = props;
    const speakerToDelete = speakers.speakers_list.find(s => s.id === speakerId);

    if (speakerToDelete.redeemed) {
      Swal.fire({
        title: T.translate("edit_promo_code.cannot_unassign_speaker_warning_title"),
        text: T.translate("edit_promo_code.cannot_unassign_speaker_warning"),
        type: "warning"
      });
      return;
    }

    Swal.fire({
      title: T.translate("general.are_you_sure"),
      text: `${T.translate("edit_promo_code.unassign_speaker_warning")} ${speakerToDelete.first_name} ${speakerToDelete.last_name} `,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: T.translate("general.yes_delete")
    }).then(function(result){
      if (result.value) {
        unAssignSpeaker(class_name, id, speakerId);
      }
    });
  }

  const handleSearch = (term) => {
    const {entity} = props;
    const {speakers: {order, orderDir, currentPage, perPage}} = entity;
    props.getAssignedSpeakers(entity, term, currentPage, perPage, order, orderDir);
  }

  const handlePageChange = (page) => {
    const {entity} = props;
    const {speakers: {term, order, orderDir, perPage}, class_name} = entity;
    props.getAssignedSpeakers(entity, term, page, perPage, order, orderDir);
  }

  const handleSort = (index, key, dir, func) => {
    const {entity} = props;
    const {speakers: {term, currentPage, perPage}, class_name} = entity;
    props.getAssignedSpeakers(entity, term, currentPage, perPage, key, dir);
  }

  const columns = [
    { columnKey: 'id', value: 'Id', sortable: true },
    { columnKey: 'full_name', value: T.translate("general.name"), sortable: true },
    { columnKey: 'email', value: T.translate("general.email"), sortable: true },
    { columnKey: 'email_sent', value: T.translate("edit_promo_code.assigned_speakers_list.email_sent"), sortable: true },
    { columnKey: 'redeemed', value: T.translate("edit_promo_code.assigned_speakers_list.redeemed"), sortable: true }
  ];

  const table_options = {
    sortCol: order,
    sortDir: orderDir,
    actions: {
      delete: { onClick: handleDelete }
    }
  };

  return(
    <>
      <hr/>
      <label> {T.translate("edit_promo_code.speakers")} </label>
      <div className="row">
        <div className="col-md-6" style={{ zIndex: 0 }}>
          <FreeTextSearch
            value={term ?? ''}
            placeholder={T.translate("edit_promo_code.placeholders.search_speakers")}
            onSearch={handleSearch}
            preventEvents={true}
          />
        </div>
        <div className="col-md-4">
          <SpeakerInput
            id="speaker"
            value={entity.speaker}
            placeholder={T.translate("edit_promo_code.placeholders.speaker_to_assign")}
            onChange={props.handleChange}
            summitId={summit.id}
            error={props.hasErrors('speaker_id')}
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary" onClick={handleSpeakerAssignment}>
            {T.translate("edit_promo_code.assign_speaker")}
          </button>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <Table
            options={table_options}
            data= {
              filtered_speakers_list.map(sp => ({...sp,
                email_sent: sp.email_sent ? T.translate("general.yes") : T.translate("general.no"),
                redeemed: sp.redeemed ? T.translate("general.yes") : T.translate("general.no")
              }))
            }
            columns={columns}
            onSort={handleSort}
          />
          <Pagination
            bsSize="medium"
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            maxButtons={10}
            items={lastPage}
            activePage={currentPage}
            onSelect={handlePageChange}
          />
        </div>
      </div>
      <hr/>
    </>
  );
};

export default SpeakersBasePCForm;