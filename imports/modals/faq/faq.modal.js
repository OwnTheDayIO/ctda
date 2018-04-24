// Template Component
import './faq.modal.html';

Template.faqModal.onRendered(function Template_faqModal_onRendered() {
    Meteor.defer(() => $('.collapse').collapse());
});
