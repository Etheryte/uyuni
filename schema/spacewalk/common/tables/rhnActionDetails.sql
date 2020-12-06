--
-- Copyright (c) 2020 SUSE LLC 
--
-- This software is licensed to you under the GNU General Public License,
-- version 2 (GPLv2). There is NO WARRANTY for this software, express or
-- implied, including the implied warranties of MERCHANTABILITY or FITNESS
-- FOR A PARTICULAR PURPOSE. You should have received a copy of GPLv2
-- along with this software; if not, see
-- http://www.gnu.org/licenses/old-licenses/gpl-2.0.txt.
--
-- Red Hat trademarks are not licensed under GPLv2. No permission is
-- granted to use or replicate Red Hat trademarks that are incorporated
-- in this software or its documentation.
--


CREATE TABLE rhnActionDetails
(
    action_id  NUMERIC NOT NULL
                   CONSTRAINT rhn_act_eu_act_fk
                       REFERENCES rhnAction (id)
                       ON DELETE CASCADE,
    allow_vendor_change  CHAR(1) DEFAULT ('N') NOT NULL 
    CONSTRAINT rhn_actdet_avc_ck CHECK (allow_vendor_change in ('Y','N'))
);

CREATE INDEX rhn_act_eud_aid_idx
    ON rhnActionDetails (action_id);